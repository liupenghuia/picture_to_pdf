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
        this.isLoading = false;
        
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
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.resetState();
        this.showLoading();
        
        try {
            await this.loadImagesSequentially();
            this.updateStats();
            
            // 如果没有加载到任何图片，显示提示
            if (this.loadedImages === 0) {
                this.showNoImagesMessage();
            } else {
                this.hideLoading();
            }
        } catch (error) {
            console.error('加载图片时发生错误:', error);
            this.showError('加载图片时发生错误：' + error.message);
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * 顺序加载图片
     */
    async loadImagesSequentially() {
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 5; // 连续失败5次后停止
        let lastSuccessfulImage = 0; // 记录最后一张成功加载的图片编号
        
        while (consecutiveFailures < maxConsecutiveFailures) {
            const imageLoaded = await this.tryLoadImage(this.currentImageNumber);
            
            if (imageLoaded) {
                consecutiveFailures = 0; // 重置失败计数
                lastSuccessfulImage = this.currentImageNumber;
                this.currentImageNumber++;
            } else {
                consecutiveFailures++;
                this.currentImageNumber++;
            }
            
            // 如果连续失败次数过多，可能已经到达图片末尾
            if (consecutiveFailures >= 3) {
                // 再尝试几个数字，确保不是临时问题
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    break;
                }
            }
        }
        
        // 更新总图片数为实际加载的数量
        this.totalImages = this.loadedImages;
    }
    
    /**
     * 显示加载状态
     */
    showLoading() {
        this.imageContainer.innerHTML = `
            <div class="loading">正在搜索图片文件...</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        // 重新获取进度条元素引用
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
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
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            
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
            // 使用当前检查的图片编号作为进度参考
            const maxExpectedImages = 20; // 假设最多20张图片
            const progress = (this.currentImageNumber / maxExpectedImages) * 100;
            this.progressFill.style.width = `${Math.min(progress, 100)}%`;
        }
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        if (this.statsElement) {
            const lastImageNumber = this.loadedImages > 0 ? this.currentImageNumber - 1 : 0;
            const searchRange = `1-${Math.min(lastImageNumber + 5, 20)}`; // 显示搜索范围
            
            this.statsElement.innerHTML = `
                已加载 ${this.loadedImages} 张图片 | 
                搜索范围: ${searchRange} | 
                按 R 键重新加载
            `;
        }
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const loadingElement = this.imageContainer.querySelector('.loading');
        const progressBarElement = this.imageContainer.querySelector('.progress-bar');
        
        if (loadingElement) {
            loadingElement.remove();
        }
        if (progressBarElement) {
            progressBarElement.remove();
        }
    }
    
    /**
     * 显示无图片消息
     */
    showNoImagesMessage() {
        this.imageContainer.innerHTML = `
            <div class="error">
                <h3>未找到图片文件</h3>
                <p>在 <code>src</code> 文件夹中搜索了编号 1-${this.currentImageNumber - 1} 的图片，但未找到任何文件。</p>
                <p>请确保文件夹中包含按数字顺序命名的图片文件：</p>
                <ul style="text-align: left; display: inline-block; margin: 20px 0;">
                    <li>1.png, 1.jpg, 1.jpeg 等</li>
                    <li>2.png, 2.jpg, 2.jpeg 等</li>
                    <li>3.png, 3.jpg, 3.jpeg 等</li>
                </ul>
                <p><strong>支持的格式：</strong> ${this.imageExtensions.join(', ').toUpperCase()}</p>
                <p><strong>搜索范围：</strong> 1-${this.currentImageNumber - 1}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 10px; cursor: pointer;">重新加载</button>
            </div>
        `;
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
        if (!this.isLoading) {
            this.loadImages();
        }
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