document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');
    const imageDisplay = document.getElementById('output-image');
    
    const showNumberOverlay = document.getElementById('show-number-overlay');
    const fangTip = document.getElementById('fang-tip');
    
    // Tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = {
        'text': document.getElementById('tab-content-text'),
        'image': document.getElementById('tab-content-image')
    };
    
    const legendGrid = document.getElementById('legend-grid');
    const modeInfo = document.getElementById('mode-info');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');

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


    const charToPinyin = {};

    siblings.forEach(s => {
        // 拼音映射
        charToPinyin[s.char] = s.pinyin;
    });

    // 更新 UI
    function updateModeUI() {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

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
            // 十三进制显示
            if (num === 10) keyDisplay = '10';
            else if (num === 11) keyDisplay = '11';
            else if (num === 12) keyDisplay = '12';
            else keyDisplay = num.toString();

            item.innerHTML = `<span>${keyDisplay}</span> <span>${s.char}</span>`;
            
            // 点击输入功能
            item.onclick = () => {
                const startPos = inputArea.selectionStart;
                const endPos = inputArea.selectionEnd;
                const textToAdd = keyDisplay;
                
                const val = inputArea.value;
                inputArea.value = val.substring(0, startPos) + textToAdd + val.substring(endPos);
                
                inputArea.selectionStart = inputArea.selectionEnd = startPos + textToAdd.length;
                inputArea.focus();
                
                // 触发 input 事件
                const event = new Event('input');
                inputArea.dispatchEvent(event);
            };

            legendGrid.appendChild(item);
        });

        // 模式说明
        if (activeTab === 'image') {
            modeInfo.innerHTML = `
                <strong>图片生成 - 十三进制模式</strong><br>
                输入 10 -> 方 (快去催yj出立绘)。<br>
                输入 11 -> 夕。<br>
                输入 12 -> 余。
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
    function convertText(text) {
        if (!text) return '';
        let result = '';
        
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
            
            // Base13 模式，优先处理双字符
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
                    // 咕咕嘎嘎!!!
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
            outputArea.value = convertText(val);
        }
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
        
        const padding = 20; // 恢复边距以便更好地布局
        const gap = -6;
        const itemHeight = 100;
        const maxWidth = 800; // 最大宽度
        
        ctx.font = '16px Arial'; 
        
        // 预计算位置
        const itemLayouts = [];
        let currentX = padding;
        let currentY = padding;
        let maxRowHeight = 0;
        let maxCanvasWidth = 0;

        children.forEach(child => {
            let width, height;
            if (child.classList.contains('img-wrapper')) {
                width = 80;
                height = 80;
            } else {
                width = ctx.measureText(child.innerText).width;
                height = 20; 
            }

            // 换行逻辑
            if (currentX + width > maxWidth) {
                currentX = padding;
                currentY += (maxRowHeight > 0 ? maxRowHeight : itemHeight) + gap;
                maxRowHeight = 0;
            }

            itemLayouts.push({
                element: child,
                x: currentX,
                y: currentY,
                width: width,
                height: height
            });

            maxCanvasWidth = Math.max(maxCanvasWidth, currentX + width);
            
            if (child.classList.contains('img-wrapper')) {
                maxRowHeight = Math.max(maxRowHeight, 80);
            } else {
                maxRowHeight = Math.max(maxRowHeight, 20);
            }

            currentX += width + gap;
        });

        // Final Canvas Size
        canvas.width = Math.max(maxCanvasWidth + padding, 200);
        canvas.height = currentY + (maxRowHeight || itemHeight) + padding;
        
        // 绘制背景
        ctx.fillStyle = '#2b2b2b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let loadPromises = [];

        itemLayouts.forEach((layout) => {
            const child = layout.element;
            const x = layout.x;
            const y = layout.y; 

            const rowCenterY = y + 40; 

            if (child.classList.contains('img-wrapper')) {
                const img = child.querySelector('img');
                const overlay = child.querySelector('.img-number');
                const isOverlayVisible = overlay && !overlay.classList.contains('hidden');
                
                loadPromises.push(new Promise((resolve) => {
                    const drawImg = () => {
                         const aspectRatio = img.naturalWidth / img.naturalHeight;
                         let drawWidth = 80;
                         let drawHeight = 80;
                         
                         if (aspectRatio > 1) {
                             drawHeight = drawWidth / aspectRatio;
                         } else {
                             drawWidth = drawHeight * aspectRatio;
                         }
                         
                         const yOffset = (80 - drawHeight) / 2;
                         const xOffset = (80 - drawWidth) / 2;
                         
                         ctx.drawImage(img, x + xOffset, y + yOffset, drawWidth, drawHeight);
                         
                         if (isOverlayVisible) {
                             ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                             const numText = overlay.innerText;
                             ctx.font = '12px monospace';
                             const textWidth = ctx.measureText(numText).width;
                             ctx.fillRect(x, y + 65, textWidth + 8, 15); // Position relative to top
                             
                             ctx.fillStyle = '#00C8FF';
                             ctx.fillText(numText, x + 4, y + 76);
                         }
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
                    ctx.fillText(child.innerText, x, y + 40);
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