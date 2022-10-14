import { getGlobal } from "./server.ts";
import { dateFormat } from "./import.ts";
import { Log, LoggerBaseInfo, LogLevel } from "./types.ts";
/* 日志队列 */
const LOG_QUEUE: Array<Logger> = [];
/* 日志写入是否正在运行 */
let LOG_RUN_FLAG = false;

/**
 * 日志收集器
 */
export class Logger {
  /* 日志等级 默认：LogLevel.INFO */
  readonly level: LogLevel;
  /* 写入的文本数据  */
  readonly text: string;
  /**
   * 构造函数
   */
  constructor(level: LogLevel, text: string) {
    this.level = level;
    this.text = text;
  }
  /**
   * 初始化
   */
  init() {
    setTimeout(() => {
      if (LOG_RUN_FLAG) {
        LOG_QUEUE.push(this);
        return;
      }
      LOG_QUEUE.push(this);
      LOG_RUN_FLAG = true;
      this.mkdir();
    });
  }
  /**
   * 创建目录
   */
  async mkdir() {
    const baseDir = getGlobal().runOption?.logger?.dir;
    if (baseDir === undefined) return;
    const date = dateFormat(new Date(), "yyyy-MM-dd");
    const log = LOG_QUEUE[0];
    const dir = `${baseDir}/${date}/${log.level}`;
    let path = "";
    try {
      /* 获取目录下文件 */
      const tempList: Array<Deno.DirEntry> = [];
      const dirFiles = Deno.readDir(dir);
      for await (const item of dirFiles) {
        tempList.push(item);
      }
      path = `${dir}/${log.level}_${tempList.length - 1}.log`;
      /* 判断文件是否超出大小 */
      const size = (await Deno.stat(path)).size;
      const fileSize = getGlobal().runOption?.logger?.fileSize;
      if (fileSize === undefined) return;
      if (size >= fileSize) {
        path = `${dir}/${log.level}_${tempList.length}.log`;
        log.write(path);
        return;
      }
      log.write(path, { create: false, append: true });
    } catch (_err) {
      /* 目录不存在,创建目录 */
      await Deno.mkdir(dir, { recursive: true });
      path = `${dir}/${log.level}_0.log`;
      log.write(path);
    }
  }
  /**
   * 创建目录
   * 参数 path - 文件路径
   * 参数 options - 写入文件的参数
   */
  async write(path: string, options?: Deno.WriteFileOptions) {
    await Deno.writeTextFile(
      path,
      `${this.text},\n`,
      options,
    );
    LOG_QUEUE.shift();
    if (LOG_QUEUE.length > 0) {
      this.mkdir();
      return;
    }
    LOG_RUN_FLAG = false;
  }
  /**
   * 日志收集器基础信息初始化
   * 参数 info - 初始化信息
   */
  static baseInfoInit(info?: LoggerBaseInfo): LoggerBaseInfo {
    return {
      run: info?.run ?? true,
      dir: info?.dir ?? undefined,
      fileSize: info?.fileSize ?? 1024 * 1024 * 10,
    };
  }
}

/**
 * 日志方法实现
 */
export const log: Log = {
  info(text: string) {
    new Logger(LogLevel.INFO, text).init();
  },
  error(text: string) {
    new Logger(LogLevel.ERROR, text).init();
  },
};
