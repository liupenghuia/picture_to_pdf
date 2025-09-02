/**
 * 项目配置文件
 */
const CONFIG = {
    // 支持的图片格式
    IMAGE_EXTENSIONS: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'],
    
    // 图片文件夹路径
    IMAGE_FOLDER: 'src/',
    
    // 图片命名规则
    IMAGE_NAMING_PATTERN: 'number', // 'number' 或 'custom'
    
    // 加载延迟（毫秒）
    LOAD_DELAY: 100,
    
    // 最大连续失败次数
    MAX_CONSECUTIVE_FAILURES: 5,
    
    // 最大预期图片数量
    MAX_EXPECTED_IMAGES: 20,
    
    // 打印设置
    PRINT_SETTINGS: {
        silent: false,
        printBackground: true,
        color: true,
        margin: {
            marginType: 'none'
        },
        landscape: false,
        pagesPerSheet: 1,
        collate: false,
        copies: 1,
        header: '',
        footer: ''
    },
    
    // UI设置
    UI: {
        showImageInfo: true,        // 是否显示图片信息（尺寸、大小）
        showProgressBar: true,      // 是否显示进度条
        showStats: true,            // 是否显示统计信息
        enableKeyboardShortcuts: true,  // 是否启用键盘快捷键
        enableLazyLoading: true,    // 是否启用图片懒加载
        showLoadingDetails: false   // 是否显示详细加载信息
    },
    
    // 主题设置
    THEME: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        shadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    },
    
    // 响应式断点
    BREAKPOINTS: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    
    // 调试设置
    DEBUG: {
        enableConsoleLog: true,     // 是否启用控制台日志
        showLoadingTime: false      // 是否显示加载时间
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 