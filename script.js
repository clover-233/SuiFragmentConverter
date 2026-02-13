document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');
    const imageDisplay = document.getElementById('output-image');
    
    // Controls
    const mainModeBtn = document.getElementById('main-mode-btn');
    const showNumberOverlay = document.getElementById('show-number-overlay');
    const fangTip = document.getElementById('fang-tip');
    
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = {
        'text': document.getElementById('tab-content-text'),
        'image': document.getElementById('tab-content-image')
    };
    
    const legendGrid = document.getElementById('legend-grid');
    const modeInfo = document.getElementById('mode-info');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');

    let currentTextMode = 'decimal';
    let activeTab = 'text';

    // 数据定义
    const siblings = [
        { num: 1, char: '朔', pinyin: 'Shuo', decimal: '1', base13: '1' },
        { num: 2, char: '望', pinyin: 'Wang', decimal: '2', base13: '2' },
        { num: 3, char: '令', pinyin: 'Ling', decimal: '3', base13: '3' },
        { num: 4, char: '均', pinyin: 'Jun', decimal: '4', base13: '4' },
        { num: 5, char: '颉', pinyin: 'Jie', decimal: '5', base13: '5' },
        { num: 6, char: '黍', pinyin: 'Shu', decimal: '6', base13: '6' },
        { num: 7, char: '绩', pinyin: 'Ji', decimal: '7', base13: '7' },
        { num: 8, char: '易', pinyin: 'Yi', decimal: '8', base13: '8' },
        { num: 9, char: '年', pinyin: 'Nian', decimal: '9', base13: '9' },
        { num: 10, char: '方', pinyin: 'Fang', decimal: '10', base13: '方' },
        { num: 11, char: '夕', pinyin: 'Xi', decimal: '11', base13: '夕' },
        { num: 12, char: '余', pinyin: 'Yu', decimal: '12', base13: '余' },
        { num: 0, char: '岁', pinyin: 'Sui', decimal: '0', base13: '0' }
    ];


    const decimalToChar = {};
    const charToDecimal = {};
    const charToPinyin = {};

    siblings.forEach(s => {
        // 十进制
        if (s.num >= 0 && s.num <= 9) decimalToChar[s.num.toString()] = s.char;
        charToDecimal[s.char] = s.num.toString();
        
        // 拼音映射
        charToPinyin[s.char] = s.pinyin;
    });

    // 更新 UI
    function updateModeUI() {
        // 更新大按钮文本
        const btnText = mainModeBtn.querySelector('.btn-text');
        const btnSub = mainModeBtn.querySelector('.btn-sub');
        
        if (currentTextMode === 'decimal') {
            btnText.textContent = '当前模式：十进制';
            btnSub.textContent = '点击切换至 十三进制';
            mainModeBtn.dataset.mode = 'decimal';
        } else {
            btnText.textContent = '当前模式：十三进制';
            btnSub.textContent = '点击切换至 十进制';
            mainModeBtn.dataset.mode = 'base13';
        }

        // Tab UI Update
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Content Visibility
        Object.keys(tabContents).forEach(key => {
            if (key === activeTab) {
                tabContents[key].classList.remove('hidden');
            } else {
                tabContents[key].classList.add('hidden');
            }
        });

        // 对照表更新
        legendGrid.innerHTML = '';
        const displayOrder = [1,2,3,4,5,6,7,8,9,0,10,11,12];
        
        displayOrder.forEach(num => {
            const s = siblings.find(sib => sib.num === num);
            const item = document.createElement('div');
            item.className = 'item';
            
            let keyDisplay = '';
            // 在对照表中，显示当前文本模式对应的键值
            if (currentTextMode === 'decimal') {
                if (num === 0) keyDisplay = '0';
                else if (num <= 9) keyDisplay = num.toString();
                else keyDisplay = num.toString();
            } else {
                // 十三进制显示
                if (num === 10) keyDisplay = '10';
                else if (num === 11) keyDisplay = '11';
                else if (num === 12) keyDisplay = '12';
                else keyDisplay = num.toString();
            }

            item.innerHTML = `<span>${keyDisplay}</span> <span>${s.char}</span>`;
            legendGrid.appendChild(item);
        });

        // 模式说明
        if (activeTab === 'image') {
            if (currentTextMode === 'decimal') {
                modeInfo.innerHTML = `
                    <strong>图片生成- 十进制模式</strong><br>
                    输入 10 -> 自动转换为 1(朔) + 0(岁)。<br>
                    输入 11, 12 等将作为独立字符处理。<br>
                    输入方 -> 快去催yj出立绘。
                `;
            } else {
                modeInfo.innerHTML = `
                    <strong>图片生成 - 十三进制模式</strong><br>
                    输入 10 -> 方 (快去催yj出立绘)。<br>
                    输入 11 -> 夕。<br>
                    输入 12 -> 余。
                `;
            }
        } else if (currentTextMode === 'decimal') {
            modeInfo.innerHTML = `
                <strong>文字转换 - 十进制模式</strong><br>
                输入 10 -> 朔岁。<br>
                文字输出。
            `;
        } else {
            modeInfo.innerHTML = `
                <strong>文字转换 - 十三进制模式</strong><br>
                输入 10 -> 方。<br>
                输入 11 -> 夕。<br>
                输入 12 -> 余。<br>
                文字输出。
            `;
        }
        
        // 触发重算
        const event = new Event('input');
        inputArea.dispatchEvent(event);
    }

    // 转换逻辑 (文本模式)
    function convertText(text, mode) {
        if (!text) return '';
        let result = '';
        
        if (mode === 'decimal') {
             for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (decimalToChar.hasOwnProperty(char)) {
                    result += decimalToChar[char];
                } else if (charToDecimal.hasOwnProperty(char)) {
                    result += charToDecimal[char];
                } else {
                    result += char;
                }
            }
        } else {
            // 十三进制逻辑
            let i = 0;
            while (i < text.length) {
                const twoChars = text.substr(i, 2);
                if (twoChars === '10') { result += '方'; i += 2; continue; }
                if (twoChars === '11') { result += '夕'; i += 2; continue; }
                if (twoChars === '12') { result += '余'; i += 2; continue; }
                
                const char = text[i];
                if (/[0-9]/.test(char)) {
                    if (char === '0') result += '岁';
                    else {
                         const num = parseInt(char);
                         const s = siblings.find(sib => sib.num === num);
                         if (s) result += s.char;
                         else result += char;
                    }
                } else if (char === '方') { result += '10'; }
                else if (char === '夕') { result += '11'; }
                else if (char === '余') { result += '12'; }
                else {
                    const s = siblings.find(sib => sib.char === char);
                    if (s && s.num < 10 && s.num > 0) result += s.num.toString();
                    else if (char === '岁') result += '0';
                    else result += char;
                }
                i++;
            }
        }
        return result;
    }

    // 图片生成逻辑
    function updateImages(text) {
        imageDisplay.innerHTML = '';
        fangTip.classList.add('hidden'); // 先隐藏
        
        if (!text) return;

        let charSequence = [];
        

        let i = 0;
        let hasFang = false;

        while (i < text.length) {
            const twoChars = text.substr(i, 2);
            const char = text[i];
            
            // 如果是 Base13 模式，优先处理双字符
            if (currentTextMode === 'base13') {
                if (twoChars === '10') { 
                    hasFang = true; 
                    // 10 -> 方 (无立绘) -> 自动转换为 朔(1) + 岁(0)
                    charSequence.push('朔');
                    charSequence.push('岁');
                    i += 2; 
                    continue; 
                } 
                if (twoChars === '11') { charSequence.push('夕'); i += 2; continue; }
                if (twoChars === '12') { charSequence.push('余'); i += 2; continue; }
            } else {
                // Decimal 模式下，10, 11, 12 都是分开的数字
                // 除非是汉字 '方' 等
            }

            // 处理单字符
            if (/[0-9]/.test(char)) {
                // 数字处理
                if (char === '0') {
                    charSequence.push('岁');
                } else {
                    const num = parseInt(char);
                    const s = siblings.find(sib => sib.num === num);
                    if (s) charSequence.push(s.char);
                    else charSequence.push(char); 
                }
            } else {
                // 非数字字符处理
                if (char === '方') {
                    hasFang = true;
                    // 方 -> 自动转换为 朔(1) + 岁(0)
                    charSequence.push('朔');
                    charSequence.push('岁');
                }
                else charSequence.push(char);
            }
            i++;
        }

        if (hasFang) {
            fangTip.classList.remove('hidden');
        }

        // 渲染图片
        charSequence.forEach(char => {
            if (charToPinyin.hasOwnProperty(char)) {
                const pinyin = charToPinyin[char];
                
                if (char === '方') {
                    // 咕咕嘎嘎
                } else {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'img-wrapper';

                    const img = document.createElement('img');
                    img.src = `assets/Sui/${pinyin}.png`;
                    img.alt = char;
                    img.title = char;
                    img.onerror = () => {
                        img.style.display = 'none';
                        const span = document.createElement('span');
                        span.className = 'text-fallback';
                        span.innerText = char;
                        wrapper.appendChild(span);
                    };
                    wrapper.appendChild(img);

                    const s = siblings.find(sib => sib.char === char);
                    if (s) {
                        const numSpan = document.createElement('div');
                        numSpan.className = 'img-number hidden'; // Default hidden
                        numSpan.innerText = s.num;
                        wrapper.appendChild(numSpan);
                    }

                    imageDisplay.appendChild(wrapper);
                }
            } else {
                // 非岁片字符
                const span = document.createElement('span');
                span.className = 'text-fallback';
                span.innerText = char;
                imageDisplay.appendChild(span);
            }
        });

        toggleOverlays(showNumberOverlay.checked);
    }

    function toggleOverlays(show) {
        const overlays = document.querySelectorAll('.img-number');
        overlays.forEach(el => {
            if (show) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
    }

    inputArea.addEventListener('input', (e) => {
        const val = e.target.value;
        if (activeTab === 'image') {
            updateImages(val);
        } else {
            outputArea.value = convertText(val, currentTextMode);
        }
    });


    mainModeBtn.addEventListener('click', () => {
        if (currentTextMode === 'decimal') {
            currentTextMode = 'base13';
        } else {
            currentTextMode = 'decimal';
        }
        updateModeUI();
    });


    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            updateModeUI();
        });
    });


    showNumberOverlay.addEventListener('change', (e) => {
        toggleOverlays(e.target.checked);
    });

    // 复制功能
    copyBtn.addEventListener('click', () => {
        outputArea.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '已复制! (Copied!)';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });

    // 保存功能 
    saveBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        

        const children = Array.from(imageDisplay.children).filter(el => {
            return window.getComputedStyle(el).display !== 'none';
        });
        
        // 基础样式
        const itemHeight = 100; 
        const gap = 15;
        const padding = 20;
        
        ctx.font = '16px Arial'; 
        
        // 计算宽度
        const itemWidths = children.map(child => {
            if (child.classList.contains('img-wrapper')) {
                return 80; 
            } else {
                return ctx.measureText(child.innerText).width;
            }
        });
        
        let totalWidth = padding * 2;
        if (itemWidths.length > 0) {
            totalWidth += itemWidths.reduce((sum, w) => sum + w, 0);
            totalWidth += (itemWidths.length - 1) * gap;
        }
        
        canvas.width = Math.max(totalWidth, 200); 
        canvas.height = itemHeight + padding * 2;
        
        // 绘制背景
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let x = padding;
        let loadPromises = [];

        children.forEach((child, index) => {
            const width = itemWidths[index];
            const centerY = canvas.height / 2;
            
            if (child.classList.contains('img-wrapper')) {
                const img = child.querySelector('img');
                const overlay = child.querySelector('.img-number');
                const isOverlayVisible = overlay && !overlay.classList.contains('hidden');
                
                loadPromises.push(new Promise((resolve) => {
                    const drawImg = () => {
                         ctx.drawImage(img, x, centerY - 40, 80, 80);
                         
                         if (isOverlayVisible) {
                             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                             const numText = overlay.innerText;
                             ctx.font = '12px monospace';
                             const textWidth = ctx.measureText(numText).width;
                             ctx.fillRect(x, centerY + 25, textWidth + 8, 15); // Approximate position (bottom-left)
                             
                             // Text
                             ctx.fillStyle = '#00C8FF';
                             ctx.fillText(numText, x + 4, centerY + 36);
                         }
                         
                         x += width + gap;
                         resolve();
                    };
                    
                    if (img.complete && img.naturalWidth !== 0) {
                        drawImg();
                    } else {
                        img.onload = drawImg;
                        img.onerror = resolve; 
                    }
                }));
            } else {
                loadPromises.push(new Promise((resolve) => {
                    ctx.fillStyle = '#fff';
                    ctx.font = '16px Arial';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(child.innerText, x, centerY);
                    x += width + gap;
                    resolve();
                }));
            }
        });

        Promise.all(loadPromises).then(() => {
            const link = document.createElement('a');
            link.download = 'sui-fragments.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    updateModeUI();
});