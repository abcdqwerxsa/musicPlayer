import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Music, FileText, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';

// 定义表单验证 Schema
const uploadSchema = z.object({
  audioFile: z.instanceof(FileList).refine(files => files.length > 0, "音频文件是必需的。"),
  lrcFile: z.instanceof(FileList).refine(files => files.length > 0, "歌词文件是必需的。"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onUploadSuccess: () => void;
}

// 接口地址，保持和之前相同
const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || 'https://player.tuple2.dpdns.org/'; 

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // 拖拽悬浮状态管理
  const [isDragOverAudio, setIsDragOverAudio] = useState(false);
  const [isDragOverLrc, setIsDragOverLrc] = useState(false);

  // 文件 Input 引用，用来模拟点击
  const audioInputRef = useRef<HTMLInputElement>(null);
  const lrcInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      audioFile: undefined,
      lrcFile: undefined,
    },
  });

  // 监听表单内选中的文件
  const watchedAudio = form.watch('audioFile');
  const watchedLrc = form.watch('lrcFile');

  // 获取已选定文件对象
  const selectedAudioFile = watchedAudio && watchedAudio.length > 0 ? watchedAudio[0] : null;
  const selectedLrcFile = watchedLrc && watchedLrc.length > 0 ? watchedLrc[0] : null;

  const onSubmit = async (data: UploadFormValues) => {
    const audioFile = data.audioFile[0];
    const lrcFile = data.lrcFile[0];

    const loadingToastId = showLoading(`准备上传 ${audioFile.name}...`);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile, audioFile.name);
      formData.append('lyrics', lrcFile, lrcFile.name);

      const xhr = new XMLHttpRequest();
      
      // 上传进度侦听器
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      // 上传完成侦听器
      const responsePromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          dismissToast(loadingToastId);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`上传失败: ${xhr.status} - ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          dismissToast(loadingToastId);
          reject(new Error("网络异常或请求被拒绝。"));
        };
      });

      xhr.open('POST', WORKER_API_URL);
      xhr.send(formData);

      await responsePromise;

      showSuccess("上传成功！您的曲目和歌词已被处理。");
      
      // 重置表单，清空选定状态
      form.reset();
      onUploadSuccess();

    } catch (error) {
      console.error("Upload error:", error);
      showError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 辅助函数：格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* 音频拖拽上传区 */}
        <FormField
          control={form.control}
          name="audioFile"
          render={({ field: { onChange, ref, ...fieldProps } }) => (
            <FormItem>
              <FormLabel className="text-white/80 font-bold text-xs flex items-center tracking-wide uppercase">
                <Music className="w-3.5 h-3.5 mr-2 text-primary" />
                第一步：选择音频文件 (.mp3, .flac, .wav)
              </FormLabel>
              <FormControl>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploading) setIsDragOverAudio(true);
                  }}
                  onDragLeave={() => setIsDragOverAudio(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverAudio(false);
                    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      onChange(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => !isUploading && audioInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[120px] relative overflow-hidden bg-white/[0.01]",
                    isDragOverAudio 
                      ? "border-primary bg-primary/5 scale-[1.01]" 
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
                    selectedAudioFile ? "border-emerald-500/30 bg-emerald-500/[0.01] hover:border-emerald-500/50" : "",
                    isUploading ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  {/* 实际起作用的隐藏 Input */}
                  <input
                    {...fieldProps}
                    ref={(e) => {
                      ref(e);
                      // @ts-ignore
                      audioInputRef.current = e;
                    }}
                    type="file"
                    accept=".flac,.mp3,.wav"
                    onChange={(event) => {
                      if (event.target.files) {
                        onChange(event.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  
                  {selectedAudioFile ? (
                    <div className="flex items-center space-x-3 text-left w-full">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{selectedAudioFile.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(selectedAudioFile.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-white rounded-full flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setValue('audioFile', new DataTransfer().files);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground/60 group-hover:text-primary transition-colors duration-300" />
                      <div>
                        <p className="text-xs font-semibold text-white/90">拖拽音频文件到此处</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">或者点击此区域浏览本地目录</p>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-400 font-medium flex items-center mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {form.formState.errors.audioFile?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* 歌词拖拽上传区 */}
        <FormField
          control={form.control}
          name="lrcFile"
          render={({ field: { onChange, ref, ...fieldProps } }) => (
            <FormItem>
              <FormLabel className="text-white/80 font-bold text-xs flex items-center tracking-wide uppercase">
                <FileText className="w-3.5 h-3.5 mr-2 text-primary" />
                第二步：选择歌词同步文件 (.lrc)
              </FormLabel>
              <FormControl>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploading) setIsDragOverLrc(true);
                  }}
                  onDragLeave={() => setIsDragOverLrc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverLrc(false);
                    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      onChange(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => !isUploading && lrcInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[120px] relative overflow-hidden bg-white/[0.01]",
                    isDragOverLrc 
                      ? "border-primary bg-primary/5 scale-[1.01]" 
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
                    selectedLrcFile ? "border-emerald-500/30 bg-emerald-500/[0.01] hover:border-emerald-500/50" : "",
                    isUploading ? "pointer-events-none opacity-50" : ""
                  )}
                >
                  {/* 实际起作用的隐藏 Input */}
                  <input
                    {...fieldProps}
                    ref={(e) => {
                      ref(e);
                      // @ts-ignore
                      lrcInputRef.current = e;
                    }}
                    type="file"
                    accept=".lrc"
                    onChange={(event) => {
                      if (event.target.files) {
                        onChange(event.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  
                  {selectedLrcFile ? (
                    <div className="flex items-center space-x-3 text-left w-full">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{selectedLrcFile.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(selectedLrcFile.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-white rounded-full flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setValue('lrcFile', new DataTransfer().files);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground/60 group-hover:text-primary transition-colors duration-300" />
                      <div>
                        <p className="text-xs font-semibold text-white/90">拖拽歌词文件到此处</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">或者点击此区域浏览本地目录</p>
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-400 font-medium flex items-center mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {form.formState.errors.lrcFile?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        
        {/* 上传进度显示 */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">正在同步至 Cloudflare R2...</span>
              <span className="font-mono font-bold text-primary">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full h-1.5 bg-white/5" />
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full py-5 rounded-xl font-bold bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-lg active:scale-[0.98] transition-all duration-300 mt-2" 
          disabled={form.formState.isSubmitting || isUploading}
        >
          {isUploading ? `正在上传 ${uploadProgress}%` : '发布到 R2 音频存储库'}
        </Button>
      </form>
    </Form>
  );
};

export default UploadForm;