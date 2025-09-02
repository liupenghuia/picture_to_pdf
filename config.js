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
        showImageInfo: true,
        showProgressBar: true,
        showStats: true,
        enableKeyboardShortcuts: true,
        enableLazyLoading: true
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
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 