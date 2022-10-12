import { getGlobal } from "./server.ts"
/* 日志队列 */
const LOG_QUEUE: Array<Logger> = []
/* 日志写入是否正在运行 */
let LOG_RUN_FLAG = false
/**
 * 日志等级 
 */
enum LogLevel {
    /* 正常信息 */
    INFO = "info",
    /* 错误 */
    ERROR = "error",
}
/**
 *  日志收集器基础信息
 */
export interface LoggerBaseInfo {
    /* 是否启动 默认：true */
    readonly run: boolean
    /* 目录 */
    readonly dir?: string
    /* 单个日志文件最大大小 默认：10MB 1024*1024*10 */
    readonly fileSize: number
    /* 正常信息日志code列表  默认：[200] */
    readonly infoCodeList: Array<number>
}
/**
 * 日志收集器 
 */
export class Logger {
    /* 日志等级 默认：LogLevel.INFO */
    private level: LogLevel
    /* 写入的文本数据  */
    private text: string
    /**
     * 构造函数 
     */
    constructor(level: LogLevel, text: string) {
        this.level = level
        this.text = text
    }
    /**
     * 初始化
     * 参数 text - 写入的文本数据
     */
    init() {
        setTimeout(() => {
            if (LOG_RUN_FLAG) {
                LOG_QUEUE.push(this)
                return
            }
            LOG_QUEUE.push(this)
            LOG_RUN_FLAG = true
            this.write()
        });

    }
    /**
     * 写入文本
     * 参数 text - 写入的文本数据
     */
    write() {
        const log = LOG_QUEUE[0]
        console.log(log.text)
        console.log(log.level)
        console.log(getGlobal())
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
            infoCodeList: info?.infoCodeList ?? [200],
        }
    }
}
/**
 * 日志方法 
 */
export interface Log {
    /* 正常信息 */
    info: (text: string) => void
    /* 错误信息 */
    error: (text: string) => void
}
/**
 * 日志方法实现 
 */
export const log: Log = {
    info(text: string) {
        new Logger(LogLevel.INFO, text).init()
    },
    error(text: string) {
        new Logger(LogLevel.ERROR, text).init()
    }
}