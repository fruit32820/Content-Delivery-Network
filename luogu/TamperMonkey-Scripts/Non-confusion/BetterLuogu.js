// ==UserScript==
// @name		 更好的洛谷
// @version      0.14-fixbug
// @description  支持洛谷卡片背景自定义（支持HEX、RGBA，有预览）、本地持久化、跨页同步、自动关闭广告
// @author	     Zheng Haozhe
// @match		 https://*.luogu.com.cn/*
// @icon		 https://www.luogu.com.cn/favicon.ico
// @grant		 none
// @run-at	     document-start
// @namespace	 https://github.com/fruit32820
// @homepageURL  https://github.com/fruit32820/Content-Delivery-Network
// @source       https://github.com/fruit32820/Content-Delivery-Network/blob/main/luogu/TamperMonkey-Scripts/BetterLuogu.js
// @supportURL   https://github.com/fruit32820/Content-Delivery-Network/issues?q=label%3ATamperMonkeyScript%3Aluogu%2FBetterLuogu.js
// @updateURL    https://github.com/fruit32820/Content-Delivery-Network/raw/refs/heads/main/luogu/TamperMonkey-Scripts/BetterLuogu.js
// @downloadURL  https://github.com/fruit32820/Content-Delivery-Network/raw/refs/heads/main/luogu/TamperMonkey-Scripts/BetterLuogu.js
// ==/UserScript==
(function() {
	'use strict';

	const uris={
		settings: {
			black: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 32 32' viewBox='0 0 32 32'%3E%3Cpath d='M27.526,18.036L27,17.732c-0.626-0.361-1-1.009-1-1.732s0.374-1.371,1-1.732l0.526-0.304c1.436-0.83,1.927-2.662,1.098-4.098l-1-1.732c-0.827-1.433-2.666-1.925-4.098-1.098L23,7.339c-0.626,0.362-1.375,0.362-2,0c-0.626-0.362-1-1.009-1-1.732V5c0-1.654-1.346-3-3-3h-2c-1.654,0-3,1.346-3,3v0.608c0,0.723-0.374,1.37-1,1.732c-0.626,0.361-1.374,0.362-2,0L8.474,7.036C7.042,6.209,5.203,6.701,4.375,8.134l-1,1.732c-0.829,1.436-0.338,3.269,1.098,4.098L5,14.268C5.626,14.629,6,15.277,6,16s-0.374,1.371-1,1.732l-0.526,0.304c-1.436,0.829-1.927,2.662-1.098,4.098l1,1.732c0.828,1.433,2.667,1.925,4.098,1.098L9,24.661c0.626-0.363,1.374-0.361,2,0c0.626,0.362,1,1.009,1,1.732V27c0,1.654,1.346,3,3,3h2c1.654,0,3-1.346,3-3v-0.608c0-0.723,0.374-1.37,1-1.732c0.625-0.361,1.374-0.362,2,0l0.526,0.304c1.432,0.826,3.271,0.334,4.098-1.098l1-1.732C29.453,20.698,28.962,18.865,27.526,18.036z M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S18.757,21,16,21z'/%3E%3C/svg%3E",
			white: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' enable-background='new 0 0 32 32' viewBox='0 0 32 32'%3E%3Cpath fill='%23ffffff' d='M27.526,18.036L27,17.732c-0.626-0.361-1-1.009-1-1.732s0.374-1.371,1-1.732l0.526-0.304c1.436-0.83,1.927-2.662,1.098-4.098l-1-1.732c-0.827-1.433-2.666-1.925-4.098-1.098L23,7.339c-0.626,0.362-1.375,0.362-2,0c-0.626-0.362-1-1.009-1-1.732V5c0-1.654-1.346-3-3-3h-2c-1.654,0-3,1.346-3,3v0.608c0,0.723-0.374,1.37-1,1.732c-0.626,0.361-1.374,0.362-2,0L8.474,7.036C7.042,6.209,5.203,6.701,4.375,8.134l-1,1.732c-0.829,1.436-0.338,3.269,1.098,4.098L5,14.268C5.626,14.629,6,15.277,6,16s-0.374,1.371-1,1.732l-0.526,0.304c-1.436,0.829-1.927,2.662-1.098,4.098l1,1.732c0.828,1.433,2.667,1.925,4.098,1.098L9,24.661c0.626-0.363,1.374-0.361,2,0c0.626,0.362,1,1.009,1,1.732V27c0,1.654,1.346,3,3,3h2c1.654,0,3-1.346,3-3v-0.608c0-0.723,0.374-1.37,1-1.732c0.625-0.361,1.374-0.362,2,0l0.526,0.304c1.432,0.826,3.271,0.334,4.098-1.098l1-1.732C29.453,20.698,28.962,18.865,27.526,18.036z M16,21c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S18.757,21,16,21z'/%3E%3C/svg%3E",
		}
	}

	let pageObserver = null;
	let dynamicStyle = null;
	let settingPanel = null;
	let storageSyncLock = false;
	let isRunningFastRun = false;
	let gearBtn = null;

	// 默认配置
	const defaultConfig = {
		r: 255, g: 255, b: 255, a: 0.6,
		fullScreenBg: true,
		footerBlur0: true,
		autoCloseAd: true
	};
	let config = structuredClone(defaultConfig);

	const STORAGE_KEY = 'luogu-card-custom-config';
	function saveConfigToStorage() {
		if (storageSyncLock) return;
		const { ['--theme-body-image-position-x']: _, ...save } = config;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
	}
	function getBgPosX() {
		const el = document.querySelector('.theme-page');
		if (!el) return null;
		const posStr = el.style.getPropertyValue('--theme-body-image-position').trim();
		const [x] = posStr.split(/\s+/);
		return x;
	}
	function loadConfigFromStorage() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return false;
		config['--theme-body-image-position-x'] = getBgPosX();
		try {
			const parseData = JSON.parse(raw);
			Object.keys(defaultConfig).forEach(key => {
				if (parseData[key] !== undefined) config[key] = parseData[key];
			});
			return true;
		} catch (e) {
			return false;
		}
	}
	window.addEventListener('storage', (e) => {
		if (e.key !== STORAGE_KEY) return;
		storageSyncLock = true;
		loadConfigFromStorage();
		applyTheme();
		if (settingPanel) refreshPanelInput();
		setTimeout(() => {storageSyncLock = false}, 100);
	});

	// HEX RGBA转换
	function rgbaToHex(r, g, b, a) {
		const toHex = (n) => n.toString(16).padStart(2, '0');
		const alpha = Math.round(a * 255);
		return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
	}
	function hexToRgba(hexStr) {
		let hex = hexStr.replace('#', '');
		if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
		const r = parseInt(hex.slice(0, 2), 16) || 0;
		const g = parseInt(hex.slice(2, 4), 16) || 0;
		const b = parseInt(hex.slice(4, 6), 16) || 0;
		let a = 1;
		if (hex.length >= 8) a = parseInt(hex.slice(6, 8), 16) / 255;
		return { r, g, b, a: Number(a.toFixed(2)) };
	}
	function getCurrentRgbaStr() {
		const { r, g, b, a } = config;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	// 全局样式
	function initBaseStyle() {
		if (dynamicStyle) return;
		const style = document.createElement('style');
		style.id = 'luogu-card-custom-style';
		style.textContent = `
			html, body {
				background: transparent !important;
			}
			.luogu-card-setting-btn.link {
				display: inline-flex;
				align-items: center;
				cursor: pointer;
			}
			.luogu-card-setting-panel {
				font-size: 13px;
				position: fixed;
				top: 60px;
				right: 90px;
				width: 220px;
				padding: 10px;
				background: rgba(30,30,40,0.55);
				backdrop-filter: blur(3px);
				border-radius: 10px;
				color: #fff;
				z-index: 99999;
				box-shadow: 0 4px 24px rgba(0,0,0,0.35);
			}
			.luogu-card-setting-panel h3 {
				font-size: 16px;
				margin: 0 0 8px;
				text-align: center;
			}
			.luogu-card-setting-panel h4 {
				margin: 0 0 7px;
				text-align: center;
			}
			.luogu-card-setting-panel hr {
				margin: 0;
			}
			.luogu-card-setting-panel .row {
				margin: 10px 0;
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				align-items: center;
			}
			.luogu-card-setting-panel .row-full {
				width: 100%;
				display: flex;
				justify-content: space-between;
			}
			.luogu-card-setting-panel input[type="text"] {
				width: 70px;
				padding: 4px 6px;
				border-radius: 4px;
				border: none;
				outline: none;
				color: #222;
			}
			.luogu-card-setting-panel input[type="range"] {
				width: 100px;
				flex:1;
			}
			.luogu-card-setting-panel input[type="range"]#aSlider {
				width: 50px;
			}
			.luogu-card-setting-panel .tip {
				font-size: 10px;
				color: #cccccc;
				margin: 4px 0 8px;
			}
			.luogu-card-setting-panel button {
				width: 100%;
				margin-top: 1.5px;
				padding: 7px;
				border: none;
				border-radius: 6px;
				cursor: pointer;
				background: #409EFF;
				color: white;
				font-size: 12px;
			}
			.color-preview {
				--size:18px;
				width:var(--size);
				height:var(--size);
				border-radius:4px;
				border:1px solid #eee;
				flex-shrink:0;
			}
			.total-color-preview {
				position: relative;
				width:100%;
				height:24px;
				border-radius:6px;
				margin:8px 0;
				border:1px solid #fff;
			}
			/*非全屏修复*/
			body.no-full-bg .theme-page::before {
				height: 100% !important;
			}
			body.no-full-bg .theme-page {
				--theme-body-image-size: auto !important;
				--theme-body-image-repeat: repeat !important;
			}
			/* 导航栏布局 */
			.user-nav nav {
				display: flex !important;
				align-items: center !important;
				flex-wrap: nowrap !important;
				gap: 8px !important;
			}
			.user-nav nav .search-wrap {
				flex-shrink: 0 !important;
			}
		`;
		document.head.appendChild(style);
		dynamicStyle = style;
	}

	// 刷新面板所有复选框、滑块值
	function refreshPanelInput() {
		if (!settingPanel) return;
		const hexInput = settingPanel.querySelector('#hexInput');
		const rSlider = settingPanel.querySelector('#rSlider');
		const gSlider = settingPanel.querySelector('#gSlider');
		const bSlider = settingPanel.querySelector('#bSlider');
		const aSlider = settingPanel.querySelector('#aSlider');
		const rVal = settingPanel.querySelector('#rVal');
		const gVal = settingPanel.querySelector('#gVal');
		const bVal = settingPanel.querySelector('#bVal');
		const aVal = settingPanel.querySelector('#aVal');
		const rPreview = settingPanel.querySelector('#rPreview');
		const gPreview = settingPanel.querySelector('#gPreview');
		const bPreview = settingPanel.querySelector('#bPreview');
		const totalPreview = settingPanel.querySelector('#totalPreview');
		const autoAdCheck = settingPanel.querySelector('#autoAdCheck');

		const hex = rgbaToHex(config.r, config.g, config.b, config.a);
		hexInput.value = hex;
		rSlider.value = config.r;
		gSlider.value = config.g;
		bSlider.value = config.b;
		aSlider.value = config.a;
		rVal.textContent = config.r;
		gVal.textContent = config.g;
		bVal.textContent = config.b;
		aVal.textContent = config.a.toFixed(2);
		rPreview.style.background = `rgb(${config.r},0,0)`;
		gPreview.style.background = `rgb(0,${config.g},0)`;
		bPreview.style.background = `rgb(0,0,${config.b})`;
		totalPreview.style.background = getCurrentRgbaStr();

		// 同步开关勾选状态
		settingPanel.querySelector('#fullBgCheck').checked = config.fullScreenBg;
		settingPanel.querySelector('#footerBlurCheck').checked = config.footerBlur0;
		autoAdCheck.checked = config.autoCloseAd;
	}

	// 创建设置面板
	function createSettingPanel() {
		if (settingPanel) {
			settingPanel.style.display = settingPanel.style.display === 'none' ? 'block' : 'none';
			return;
		}
		const panel = document.createElement('div');
		panel.className = 'luogu-card-setting-panel';
		panel.innerHTML = `
			<h3>更好的洛谷--设置</h3>
			<h4>卡片、代码块、模态框背景</h4>
			<hr/>
			<div class="row row-full">
				<span>HEX颜色</span>
				<input type="text" id="hexInput" placeholder="颜色的HEX值">
			</div>
			<div id="totalPreview" class="total-color-preview"></div>
			<div class="row">
				<span>红</span>
				<input type="range" min="0" max="255" value="${config.r}" id="rSlider">
				<span id="rVal">${config.r}</span>
				<div id="rPreview" class="color-preview"></div>
			</div>
			<div class="row">
				<span>绿</span>
				<input type="range" min="0" max="255" value="${config.g}" id="gSlider">
				<span id="gVal">${config.g}</span>
				<div id="gPreview" class="color-preview"></div>
			</div>
			<div class="row">
				<span>蓝</span>
				<input type="range" min="0" max="255" value="${config.b}" id="bSlider">
				<span id="bVal">${config.b}</span>
				<div id="bPreview" class="color-preview"></div>
			</div>
			<div class="row">
				<span>透明度</span>
				<input type="range" min="0.01" max="1" step="0.01" value="${config.a}" id="aSlider">
				<span id="aVal">${config.a.toFixed(2)}</span>
			</div>
			<h4>图片背景显示</h4>
			<hr/>
			<div class="row row-full">
				<span>背景全屏模式</span>
				<input type="checkbox" id="fullBgCheck" ${config.fullScreenBg ? 'checked' : ''}>
			</div>
			<div class="row row-full">
				<span>底部Footer取消模糊</span>
				<input type="checkbox" id="footerBlurCheck" ${config.footerBlur0 ? 'checked' : ''}>
			</div>
			<h4>实用工具</h4>
			<hr/>
			<div class="row row-full">
				<span>自动关闭页面推荐弹窗</span>
				<input type="checkbox" id="autoAdCheck" ${config.autoCloseAd ? 'checked' : ''}>
			</div>
			<button id="resetBtn">恢复默认</button>
		`;
		document.body.appendChild(panel);
		settingPanel = panel;
		refreshPanelInput();

		const hexInput = panel.querySelector('#hexInput');
		const rSlider = panel.querySelector('#rSlider');
		const gSlider = panel.querySelector('#gSlider');
		const bSlider = panel.querySelector('#bSlider');
		const aSlider = panel.querySelector('#aSlider');
		const autoAdCheck = panel.querySelector('#autoAdCheck');

		hexInput.addEventListener('input', () => {
			const rgba = hexToRgba(hexInput.value);
			config.r = rgba.r; config.g = rgba.g; config.b = rgba.b; config.a = rgba.a;
			refreshPanelInput(); applyTheme(); saveConfigToStorage();
		});
		function sliderSync() {
			config.r = Number(rSlider.value); config.g = Number(gSlider.value); config.b = Number(bSlider.value); config.a = Number(aSlider.value);
			refreshPanelInput(); applyTheme(); saveConfigToStorage();
		}
		rSlider.addEventListener('input', sliderSync);
		gSlider.addEventListener('input', sliderSync);
		bSlider.addEventListener('input', sliderSync);
		aSlider.addEventListener('input', sliderSync);

		panel.querySelector('#fullBgCheck').addEventListener('change', e => {
			config.fullScreenBg = e.target.checked; saveConfigToStorage(); applyTheme();
		});
		panel.querySelector('#footerBlurCheck').addEventListener('change', e => {
			config.footerBlur0 = e.target.checked; saveConfigToStorage(); applyTheme();
		});
		autoAdCheck.addEventListener('change', e => {
			config.autoCloseAd = e.target.checked; saveConfigToStorage(); applyTheme();
		});
		panel.querySelector('#resetBtn').addEventListener('click', () => {
			config = structuredClone(defaultConfig); saveConfigToStorage(); refreshPanelInput(); applyTheme();
		});
	}

	// 点击空白关闭设置面板
	document.addEventListener('mousedown', (e) => {
		if (!settingPanel || settingPanel.style.display === 'none') return;
		if (!gearBtn) gearBtn = document.querySelector('.luogu-card-setting-btn');
		if (!settingPanel.contains(e.target) && !gearBtn?.contains(e.target)) {
			settingPanel.style.display = 'none';
		}
	});

	// 计算颜色亮度 0(黑)~255(白)
	function getLuminance(r, g, b) {
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	// 获取元素背景平均亮度，返回明暗布尔：true=深色背景(用白色图标) false=浅色(黑色图标)
	function isAreaDark(el) {
		if (!el) return false;
		const rect = el.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return false;

		// 创建离屏canvas取色
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = 1;
		canvas.height = 1;
		// 取按钮中心像素
		ctx.drawImage(window, rect.left + rect.width / 2, rect.top + rect.height / 2, 1, 1, 0, 0, 1, 1);
		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		const lum = getLuminance(r, g, b);
		// 亮度阈值120，低于则判定深色背景
		return lum < 120;
	}

	// 更新齿轮图标颜色
	function updateGearIcon() {
		if (!gearBtn) return;
		const dark = isAreaDark(gearBtn);
		const iconSrc = dark ? uris.settings.white : uris.settings.black;
		gearBtn.innerHTML = `<img src="${iconSrc}" style="width: 20px;">`;
	}

	// 导航栏齿轮按钮插入
	function insertSettingButton() {
		const userNav = document.querySelector('.user-nav');
		if (!userNav) return;
		let navWrap = userNav.querySelector('nav');
		if (!navWrap) navWrap = userNav;
		if (navWrap.querySelector('.luogu-card-setting-btn')) return;

		const btn = document.createElement('a');
		btn.style="padding: 0;margin: 0;";
		btn.className = 'link luogu-card-setting-btn icon-btn color-none';
		btn.title = '更好的洛谷--设置';
		btn.addEventListener('click', createSettingPanel);
		navWrap.insertBefore(btn, navWrap.querySelector('.search-wrap').parentElement);
		gearBtn = btn;

		// 延迟取色更新图标（等待布局渲染完成）
		// setTimeout(updateGearIcon, 120);
	}

	// 核心页面渲染逻辑
	function applyTheme() {
		insertSettingButton();
		// 每次主题更新重新检测按钮背景切换图标
		// setTimeout(updateGearIcon, 80);

		const pageEl = document.querySelector(".theme-page");
		if (pageEl) {
            pageEl.classList.add("theme-frosted");
            pageEl.style.setProperty('--theme-body-image-size', '100%', 'important');
            pageEl.style.setProperty("--top-side-offset","0");
            pageEl.style.setProperty("--left-side-offset","0");

            if (config.fullScreenBg) {
                pageEl.classList.add("theme-mid-full");
                document.body.classList.remove('no-full-bg');
                pageEl.style.removeProperty('--theme-body-image-position');
                pageEl.style.removeProperty('--theme-body-image-repeat');
            } else {
                pageEl.classList.remove("theme-mid-full");
                document.body.classList.add('no-full-bg');
                pageEl.style.setProperty('--theme-body-image-position', `${config['--theme-body-image-position-x']} 0`, 'important');
                pageEl.style.setProperty('--theme-body-image-repeat', 'repeat', 'important');
            }

            pageEl.style.setProperty('--theme-card-background', getCurrentRgbaStr(), 'important');
            pageEl.style.removeProperty('--theme-body-mid-mask');
            pageEl.style.removeProperty('--theme-body-color');

            const footerEl = pageEl.querySelector("footer");
            if (footerEl) {
                if (config.footerBlur0) footerEl.style.setProperty('backdrop-filter', 'blur(0)', 'important');
                else footerEl.style.setProperty('backdrop-filter', 'blur(5px)', 'important');
            }
        }

		// 仅当开关开启时自动点击关闭推荐弹窗
		if (config.autoCloseAd) {
			const AdCloseBtnEl = document.querySelector(".lform-size-small.close.button-transparent");
			if (AdCloseBtnEl) AdCloseBtnEl.click();
		}

		// 模态框修改
		document.querySelectorAll("div.l-card.container.type-burger").forEach((modalEl)=>{
			modalEl.style.background=getCurrentRgbaStr();
			modalEl.style.border="#fff 2px solid";
		});
		document.querySelectorAll("div.swal2-modal").forEach((modalEl)=>{
			modalEl.style.background=getCurrentRgbaStr();
			modalEl.style.border="#fff 2px solid";
		});

		// 编辑回复框背景修改
		document.querySelector("html").style.setProperty("--lcolor--grey-1",getCurrentRgbaStr());

		// 代码框背景修改
		document.querySelectorAll("pre.lfe-code").forEach((codeEl)=>{
			codeEl.style.background=getCurrentRgbaStr();
			if(codeEl.children[0]){
				codeEl.children[0].style.background="rgba(255,255,255,0)";
			}
		});
		document.querySelectorAll("pre.pre.line-numbers").forEach((codeEl)=>{
			codeEl.style.background=getCurrentRgbaStr();
			if(codeEl.children[0]){
				codeEl.children[0].style.background="rgba(255,255,255,0)";
			}
		});

		// 底部工具栏修改
		const toolBar=document.querySelector("div.bottom-wrap.float");
		if(toolBar){
			toolBar.style.background=getCurrentRgbaStr();
		}

		// 下拉框修改
		document.querySelectorAll("div.dropdown").forEach((dropdownEl)=>{
			const chEl=dropdownEl.children[0];
			// 设置下拉框、用户下拉框、用户操作下拉框特判(需修改儿子)
			if(chEl && (chEl.classList.contains("setting-dropdown")||chEl.classList.contains("l-card","float-card")||chEl.classList.contains("dropdown-operations"))){
				dropdownEl.style.background="";
				chEl.style.background=getCurrentRgbaStr();
			} else{
				dropdownEl.style.background=getCurrentRgbaStr();
			}
		});

		// 消息吐司修改
		document.querySelectorAll(".notification-toast-stack").forEach((noEl)=>{
			noEl.style.background=getCurrentRgbaStr();
		});

		// 边框快捷栏(顶部路径栏、左侧工具栏、右侧用户栏)修改
		const topBarEl=document.querySelector("div.top-bar");
		const lSideBarEl=document.querySelector("nav.sidebar.lside.bar.nav-scrollbar");
		const rSideBarEl=document.querySelector("div.user-nav.rside.nav-scrollbar");
		if(topBarEl){
			topBarEl.style.setProperty("--theme-navi-back","rgba(84,98,119,0.48)");
		}
		if(lSideBarEl){
			lSideBarEl.style.setProperty("--theme-navi-back","rgba(84,98,119,0.48)");
		}
		if(rSideBarEl){
			rSideBarEl.style.setProperty("--theme-navi-back","rgba(84,98,119,0.48)");
		}
        console.log("ApplyTheme4");
	}

	// 页面刷新入口
	function fastRun() {
		if (isRunningFastRun) return;
		isRunningFastRun = true;
		applyTheme();
		setTimeout(() => {
			applyTheme();
			isRunningFastRun = false;
		}, 300);
	}

	// 全局页面DOM监听
	function createPageObserver() {
		const root = document.querySelector('#app') || document.documentElement;
		if (pageObserver) pageObserver.disconnect();
		pageObserver = new MutationObserver(() => fastRun());
		pageObserver.observe(root, { childList: true, subtree: true });
	}

	// 初始化流程
	initBaseStyle();
	loadConfigFromStorage();
	fastRun();
	document.addEventListener('DOMContentLoaded', fastRun);
	createPageObserver();

	// SPA路由切换销毁监听防卡死
	let lastHref = location.origin + location.pathname;
	setInterval(() => {
		if (location.href !== lastHref) {
            console.log(lastHref);
			lastHref = location.href;
			gearBtn = null;
			if (pageObserver) pageObserver.disconnect();
			if (settingPanel) { settingPanel.remove(); settingPanel = null; }
			fastRun();
			createPageObserver();
		}
	}, 300);

	// 页面卸载释放资源
	window.addEventListener('beforeunload', () => {
		if (pageObserver) pageObserver.disconnect();
		if (dynamicStyle?.parentNode) dynamicStyle.remove();
		if (settingPanel?.parentNode) settingPanel.remove();
		pageObserver = null;
		dynamicStyle = null;
		settingPanel = null;
		gearBtn = null;
	});
})();
