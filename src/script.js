// 获取Bing壁纸
async function getBingWallpaper() {
    try {
        const response = await fetch('https://7ed.net/bing/api');
        const imageUrl = response.url;
        document.body.style.backgroundImage = `url(${imageUrl})`;
        localStorage.setItem('wallpaperUrl', imageUrl);
        localStorage.setItem('wallpaperDate', new Date().toDateString());
    } catch (error) {
        console.error('获取壁纸失败:', error);
        const cachedUrl = localStorage.getItem('wallpaperUrl');
        if (cachedUrl) {
            document.body.style.backgroundImage = `url(${cachedUrl})`;
        }
    }
}

// 更新时钟显示
function updateClock() {
    const now = new Date();
    
    // 更新时间
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    // 更新日期
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    document.getElementById('date').textContent = `${year}年${month}月${day}日`;
}

// 搜索引擎配置
const searchEngines = {
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        suggestUrl: 'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&callback=callback&q='
    },
    bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        suggestUrl: 'https://api.bing.com/qsonhs.aspx?type=cb&cb=callback&q='
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://www.duckduckgo.com/?q=',
        suggestUrl: 'https://duckduckgo.com/ac/?callback=callback&q='
    }
};

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 获取搜索建议
function fetchSuggestions(query) {
    if (!query.trim()) {
        hideSuggestions();
        return;
    }

    let url = '';
    switch(currentEngine) {
        case 'google':
            url = 'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=' + encodeURIComponent(query);
            break;
        case 'bing':
            url = 'https://api.bing.com/qsonhs.aspx?type=cb&q=' + encodeURIComponent(query);
            break;
        case 'duckduckgo':
            displaySuggestions(getLocalSuggestions(query));
            return;
    }

    fetch(url, { mode: 'no-cors' })
        .then(async response => {
            let suggestions = [];
            try {
                const text = await response.text();
                if (currentEngine === 'google') {
                    const jsonpData = JSON.parse(text.replace(/^[^\[]*\[|\].*$/g, ''));
                    suggestions = jsonpData || [];
                } else if (currentEngine === 'bing') {
                    const jsonpData = JSON.parse(text.replace(/^[^\{]*\{|\}.*$/g, ''));
                    suggestions = jsonpData?.AS?.Results?.[0]?.Suggests?.map(s => s.Txt) || [];
                }
            } catch (error) {
                console.error('解析建议失败:', error);
                if (currentEngine === 'bing' || currentEngine === 'duckduckgo') {
                    suggestions = getLocalSuggestions(query);
                }
            }
            displaySuggestions(suggestions);
        })
        .catch(() => {
            hideSuggestions();
        });
}
// 获取本地历史建议（简单实现，可根据实际需求扩展）
function getLocalSuggestions(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    return history.filter(item => item.includes(query)).slice(0, 5);
}
// 在搜索时保存历史
function displaySuggestions(suggestions) {
    const container = document.querySelector('.suggestions-container');
    container.innerHTML = '';

    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', () => {
            document.getElementById('search').value = suggestion;
            window.location.href = searchEngines[currentEngine].url + encodeURIComponent(suggestion);
        });
        container.appendChild(div);
    });

    container.classList.add('active');
}

// 隐藏搜索建议
function hideSuggestions() {
    const container = document.querySelector('.suggestions-container');
    container.classList.remove('active');
    container.innerHTML = '';
}

// 初始化搜索功能
let currentEngine = 'google';

function initSearch() {
    const searchInput = document.getElementById('search');
    
    // 从localStorage加载上次选择的搜索引擎
    currentEngine = localStorage.getItem('searchEngine') || 'google';
    
    // 设置当前搜索引擎的图标状态
    document.querySelectorAll('.search-engine-icon').forEach(icon => {
        icon.classList.remove('active'); // 先清除所有图标的active状态
        if (icon.dataset.engine === currentEngine) {
            icon.classList.add('active');
        }
        
        icon.addEventListener('click', function() {
            document.querySelectorAll('.search-engine-icon').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentEngine = this.dataset.engine;
            localStorage.setItem('searchEngine', currentEngine);
            hideSuggestions();
        });
    });
    
    // 添加输入事件监听器，使用防抖
    searchInput.addEventListener('input', debounce((e) => {
        // Deleted! this does not work!
        // fetchSuggestions(e.target.value);
        hideSuggestions();
    }, 300));

    // 添加键盘事件监听器
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            const query = encodeURIComponent(searchInput.value.trim());
            // 保存历史
            let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            if (!history.includes(searchInput.value.trim())) {
                history.unshift(searchInput.value.trim());
                if (history.length > 20) history = history.slice(0, 20);
                localStorage.setItem('searchHistory', JSON.stringify(history));
            }
            window.location.href = searchEngines[currentEngine].url + query;
        }
    });

    // 点击页面其他地方时隐藏建议
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });

}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    initSearch();
    
    // 检查是否需要更新壁纸
    const lastUpdate = localStorage.getItem('wallpaperDate');
    if (!lastUpdate || lastUpdate !== new Date().toDateString()) {
        getBingWallpaper();
    } else {
        const cachedUrl = localStorage.getItem('wallpaperUrl');
        if (cachedUrl) {
            document.body.style.backgroundImage = `url(${cachedUrl})`;
        } else {
            getBingWallpaper();
        }
    }
});