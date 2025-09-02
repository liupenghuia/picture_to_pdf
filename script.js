/**
 * 图片转PDF工具
 * 主要功能：加载图片、显示进度、导出PDF
 */

class ImageToPdfConverter {
    constructor() {
        this.imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];
        this.imageContainer = document.getElementById('imageContainer');
        this.exportButton = document.getElementById('exportButton');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.statsElement = document.getElementById('stats');
        
        this.images = [];
        this.currentImageNumber = 1;
        this.loadedImages = 0;
        this.totalImages = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadImages();
    }
    
    bindEvents() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.reloadImages();
            }
        });
        
        // 导出按钮事件
        this.exportButton.addEventListener('click', () => {
            this.exportToPDF();
        });
    }
    
    /**
     * 加载图片
     */
    async loadImages() {
        this.resetState();
        this.showLoading();
        
        try {
            await this.loadImagesSequentially();
            this.updateStats();
        } catch (error) {
            this.showError('加载图片时发生错误：' + error.message);
        }
    }
    
    /**
     * 顺序加载图片
     */
    async loadImagesSequentially() {
        while (true) {
            const imageLoaded = await this.tryLoadImage(this.currentImageNumber);
            if (!imageLoaded) {
                break; // 没有更多图片
            }
            this.currentImageNumber++;
        }
    }
    
    /**
     * 尝试加载单张图片
     */
    async tryLoadImage(imageNumber) {
        for (const ext of this.imageExtensions) {
            try {
                const imagePath = `src/${imageNumber}.${ext}`;
                const imageData = await this.loadImage(imagePath);
                
                if (imageData) {
                    this.addImageToContainer(imageData, imageNumber);
                    this.loadedImages++;
                    this.updateProgress();
                    return true;
                }
            } catch (error) {
                // 继续尝试下一个扩展名
                continue;
            }
        }
        return false; // 没有找到图片
    }
    
    /**
     * 加载单张图片
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({
                    src: src,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    size: this.formatFileSize(this.getImageSize(img))
                });
            };
            
            img.onerror = () => {
                reject(new Error(`无法加载图片: ${src}`));
            };
            
            img.src = src;
        });
    }
    
    /**
     * 获取图片大小（估算）
     */
    getImageSize(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        try {
            return canvas.toDataURL('image/jpeg', 0.8).length * 0.75; // 估算字节数
        } catch (e) {
            return img.naturalWidth * img.naturalHeight * 4; // 估算为RGBA格式
        }
    }
    
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 添加图片到容器
     */
    addImageToContainer(imageData, imageNumber) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = `图片 ${imageNumber}`;
        img.loading = 'lazy'; // 懒加载
        
        const imageInfo = document.createElement('div');
        imageInfo.className = 'image-info';
        imageInfo.textContent = `图片 ${imageNumber} | ${imageData.width}×${imageData.height} | ${imageData.size}`;
        
        imageItem.appendChild(img);
        imageItem.appendChild(imageInfo);
        this.imageContainer.appendChild(imageItem);
        
        // 存储图片信息
        this.images.push(imageData);
    }
    
    /**
     * 更新进度条
     */
    updateProgress() {
        if (this.progressBar && this.progressFill) {
            const progress = (this.loadedImages / Math.max(this.currentImageNumber - 1, 1)) * 100;
            this.progressFill.style.width = `${progress}%`;
        }
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        if (this.statsElement) {
            this.statsElement.innerHTML = `
                已加载 ${this.loadedImages} 张图片 | 
                当前进度: ${this.currentImageNumber - 1} | 
                按 R 键重新加载
            `;
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        this.imageContainer.innerHTML = `
            <div class="loading">正在加载图片...</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        // 重新获取进度条元素引用
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.imageContainer.innerHTML = `<div class="error">${message}</div>`;
    }
    
    /**
     * 重置状态
     */
    resetState() {
        this.images = [];
        this.currentImageNumber = 1;
        this.loadedImages = 0;
        this.totalImages = 0;
    }
    
    /**
     * 重新加载图片
     */
    reloadImages() {
        this.loadImages();
    }
    
    /**
     * 导出PDF
     */
    exportToPDF() {
        if (this.loadedImages === 0) {
            alert('请先加载图片再导出PDF');
            return;
        }
        
        // 禁用导出按钮
        const button = this.exportButton.querySelector('button');
        button.disabled = true;
        button.textContent = '导出中...';
        
        // 隐藏不需要的元素
        this.hideElementsForPrint();
        
        // 延迟打印以确保元素隐藏
        setTimeout(() => {
            try {
                window.print();
            } catch (error) {
                console.error('打印失败:', error);
                alert('打印失败，请检查浏览器设置');
            } finally {
                // 恢复界面
                setTimeout(() => {
                    this.showElementsAfterPrint();
                    button.disabled = false;
                    button.textContent = '导出PDF';
                }, 1000);
            }
        }, 200);
    }
    
    /**
     * 打印前隐藏元素
     */
    hideElementsForPrint() {
        const elementsToHide = [this.exportButton, this.statsElement];
        elementsToHide.forEach(el => {
            if (el) el.style.display = 'none';
        });
    }
    
    /**
     * 打印后显示元素
     */
    showElementsAfterPrint() {
        const elementsToShow = [this.exportButton, this.statsElement];
        elementsToShow.forEach(el => {
            if (el) el.style.display = 'block';
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ImageToPdfConverter();
});

// 添加一些实用工具函数
const Utils = {
    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}; 