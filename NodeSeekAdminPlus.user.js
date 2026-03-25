// ==UserScript==
// @name         NodeSeek Admin Plus
// @name:zh-CN   NodeSeek 管理预设增强
// @namespace    https://github.com/hkfires/NodeSeekAdminPlus
// @version      0.1.0
// @description  Exclusive enhancement tool for NodeSeek administrators.
// @description:zh-CN  NodeSeek 管理员专属增强工具，提供后台预设及管理功能优化（仅限管理员使用）。
// @author       hKFirEs
// @match        https://www.nodeseek.com/*
// @match        https://alpha.nodeseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nodeseek.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @run-at       document-idle
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/hkfires/NodeSeekAdminPlus/master/NodeSeekAdminPlus.user.js
// @updateURL    https://raw.githubusercontent.com/hkfires/NodeSeekAdminPlus/master/NodeSeekAdminPlus.user.js
// @supportURL   https://github.com/hkfires/NodeSeekAdminPlus/issues
// ==/UserScript==

(function () {
    'use strict';

    const DEFAULT_CUSTOM_PRESETS = [
        {
            key: 'award',
            name: '推荐阅读奖励',
            coin_diff: 50,
            stardust_diff: 200,
            reason: '推荐阅读奖励',
            operations: ['coin', 'stardust', 'award']
        },
        {
            key: 'project',
            name: '优秀开源项目奖励',
            coin_diff: 30,
            stardust_diff: 200,
            reason: '优秀开源项目奖励',
            operations: ['coin', 'stardust']
        },
        {
            key: 'suggestion',
            name: '优秀建议奖励',
            coin_diff: 20,
            stardust_diff: 50,
            reason: '优秀建议奖励',
            operations: ['coin', 'stardust']
        }
    ];

    GM_addStyle(`
        .ns-custom-preset-section { display:flex;align-items:center;gap:8px;padding:6px 0 4px 0;flex-wrap:nowrap;border-bottom:1px solid #eee;margin-bottom:4px; }
        .ns-custom-preset-label { font-size:13px;color:#555;white-space:nowrap;flex-shrink:0; }
        .ns-custom-preset-select { flex:1;min-width:0;height:30px;border:1px solid #ccc;border-radius:4px;padding:0 6px;font-size:13px;background:var(--bg-color,#fff);color:var(--text-color,#333);cursor:pointer; }
        .ns-custom-preset-select:focus { outline:none;border-color:#5cb85c; }
        .ns-custom-preset-btn { height:30px;padding:0 12px;border:none;border-radius:4px;cursor:pointer;font-size:13px;white-space:nowrap;flex-shrink:0; }
        .ns-preset-apply-btn { background:#5cb85c;color:#fff; }
        .ns-preset-apply-btn:hover { background:#4cae4c; }
        .ns-preset-manage-btn { background:#f0ad4e;color:#fff; }
        .ns-preset-manage-btn:hover { background:#ec971f; }
        .ns-preset-manager-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center; }
        .ns-preset-manager-modal { background:var(--bg-color,#fff);color:var(--text-color,#333);border-radius:8px;padding:20px;width:560px;max-width:95vw;max-height:80vh;overflow-y:auto;box-shadow:0 4px 20px rgba(0,0,0,0.25); }
        .ns-preset-manager-modal h3 { margin:0 0 14px;font-size:16px;border-bottom:1px solid #eee;padding-bottom:8px; }
        .ns-preset-list { display:flex;flex-direction:column;gap:10px;margin-bottom:14px; }
        .ns-preset-item { border:1px solid #ddd;border-radius:6px;padding:10px 12px;background:var(--bg-secondary,#f9f9f9); }
        .ns-preset-item-header { display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px; }
        .ns-preset-item-name { font-weight:bold;font-size:14px;flex-shrink:0;margin-right:4px; }
        .ns-preset-item-badges { display:flex;gap:4px;flex-wrap:wrap;flex:1; }
        .ns-badge { font-size:11px;padding:2px 6px;border-radius:3px;color:#fff;white-space:nowrap; }
        .ns-badge-coin-pos { background:#5cb85c; }
        .ns-badge-coin-neg { background:#d9534f; }
        .ns-badge-star-pos { background:#f0ad4e; }
        .ns-badge-star-neg { background:#c9302c; }
        .ns-badge-op { background:#5bc0de; }
        .ns-preset-item-reason { font-size:12px;color:#888; }
        .ns-preset-item-edit { flex-shrink:0;background:#337ab7;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:12px;padding:2px 8px;height:22px;line-height:18px; }
        .ns-preset-item-edit:hover { background:#286090; }
        .ns-preset-item-del { flex-shrink:0;background:#d9534f;color:#fff;border:none;border-radius:3px;cursor:pointer;font-size:12px;padding:2px 8px;height:22px;line-height:18px; }
        .ns-preset-item-del:hover { background:#c9302c; }
        .ns-preset-add-form { border:1px solid #5cb85c;border-radius:6px;padding:12px;margin-bottom:12px;background:var(--bg-secondary,#f0fff0); }
        .ns-preset-add-form.ns-editing { border-color:#337ab7; }
        .ns-preset-add-form.ns-editing h4 { color:#337ab7; }
        .ns-preset-add-form h4 { margin:0 0 10px;font-size:14px;color:#5cb85c; }
        .ns-form-row { display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap; }
        .ns-form-row label { width:80px;font-size:13px;flex-shrink:0; }
        .ns-form-row input[type="text"],.ns-form-row input[type="number"] { flex:1;min-width:80px;height:28px;border:1px solid #ccc;border-radius:4px;padding:0 6px;font-size:13px; }
        .ns-form-row select.ns-form-select { flex:1;min-width:80px;height:28px;border:1px solid #ccc;border-radius:4px;padding:0 6px;font-size:13px; }
        .ns-form-row .ns-op-checkboxes { display:flex;gap:8px;flex-wrap:wrap;flex:1; }
        .ns-form-row .ns-op-checkboxes label { width:auto;display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer; }
        .ns-modal-footer { display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #eee;padding-top:12px; }
        .ns-btn-primary { background:#5cb85c;color:#fff;border:none;border-radius:4px;padding:6px 16px;cursor:pointer;font-size:13px; }
        .ns-btn-primary:hover { background:#4cae4c; }
        .ns-btn-secondary { background:#6c757d;color:#fff;border:none;border-radius:4px;padding:6px 16px;cursor:pointer;font-size:13px; }
        .ns-btn-secondary:hover { background:#5a6268; }
        .ns-btn-add-preset { background:#337ab7;color:#fff;border:none;border-radius:4px;padding:6px 14px;cursor:pointer;font-size:13px;margin-bottom:10px; }
        .ns-btn-add-preset:hover { background:#286090; }
        .ns-btn-cancel-edit { background:#f0ad4e;color:#fff;border:none;border-radius:4px;padding:6px 16px;cursor:pointer;font-size:13px;margin-left:8px; }
        .ns-btn-cancel-edit:hover { background:#ec971f; }
    `);

    const OP_LABELS = {
        'coin':'加/减鸡腿','stardust':'加/减星辰','suspend':'禁止发言',
        'lockDiscussion':'锁定帖子','hideComment':'隐藏帖子和评论',
        'changeRank':'修改阅读权限','changeTitle':'修改标题',
        'changeCategory':'修改类别','award':'推荐阅读'
    };

    const OP_KEY_MATCH = {
        'coin':['加/减鸡腿','鸡腿'],
        'stardust':['加/减星辰','星辰'],
        'suspend':['禁止发言'],
        'lockDiscussion':['锁定帖子','设为只读'],
        'hideComment':['隐藏帖子和评论','隐藏','强制'],
        'changeRank':['修改阅读权限','阅读权限'],
        'changeTitle':['修改标题'],
        'changeCategory':['修改类别'],
        'award':['推荐阅读']
    };

    const CATEGORY_OPTIONS = {
        'daily':'日常','tech':'技术','info':'情报','review':'测评',
        'trade':'交易','carpool':'拼车','promotion':'推广','life':'生活',
        'dev':'Dev','photo-share':'贴图','expose':'曝光',
        'inside':'内版','meaningless':'无意义','sandbox':'沙盒'
    };

    const RANK_OPTIONS = {
        '0':'公开','1':'Lv1','2':'Lv2','3':'Lv3',
        '4':'Lv4','5':'Lv5','6':'Lv6','255':'私有'
    };

    function loadCustomPresets() {
        try {
            const stored = GM_getValue('ns_custom_presets_v2', null);
            if (stored !== null) return JSON.parse(stored);
        } catch (e) {}
        const defaults = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_PRESETS));
        saveCustomPresets(defaults);
        return defaults;
    }

    function saveCustomPresets(presets) {
        GM_setValue('ns_custom_presets_v2', JSON.stringify(presets));
    }

    function injectCustomPresets(adminPanel) {
        if (adminPanel.querySelector('.ns-custom-preset-section')) return;
        const titleRow = adminPanel.children[0];
        if (!titleRow) return;
        const presets = loadCustomPresets();
        const section = document.createElement('div');
        section.className = 'ns-custom-preset-section';
        const label = document.createElement('span');
        label.className = 'ns-custom-preset-label';
        label.textContent = '自定义预设：';
        const select = document.createElement('select');
        select.className = 'ns-custom-preset-select';
        rebuildSelectOptions(select, presets);
        const applyBtn = document.createElement('button');
        applyBtn.className = 'ns-custom-preset-btn ns-preset-apply-btn';
        applyBtn.type = 'button';
        applyBtn.innerHTML = '&#9654; 应用预设';
        const manageBtn = document.createElement('button');
        manageBtn.className = 'ns-custom-preset-btn ns-preset-manage-btn';
        manageBtn.type = 'button';
        manageBtn.innerHTML = '&#9881; 管理预设';
        section.appendChild(label);
        section.appendChild(select);
        section.appendChild(applyBtn);
        section.appendChild(manageBtn);
        titleRow.insertAdjacentElement('afterend', section);
        applyBtn.addEventListener('click', () => {
            const key = select.value;
            if (!key) { alert('请先选择一个预设'); return; }
            const preset = loadCustomPresets().find(p => p.key === key);
            if (!preset) return;
            applyPreset(adminPanel, preset, section);
        });
        manageBtn.addEventListener('click', () => {
            openPresetManager(adminPanel, select);
        });
    }

    function rebuildSelectOptions(select, presets) {
        select.innerHTML = '';
        const def = document.createElement('option');
        def.value = '';
        def.textContent = '-- 选择预设 --';
        select.appendChild(def);
        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.key;
            opt.textContent = p.name;
            select.appendChild(opt);
        });
    }

    function applyPreset(adminPanel, preset, section) {
        const ops = preset.operations || buildOpsFromPreset(preset);
        const addOpRow = findAddOpRow(adminPanel);
        if (!addOpRow) { alert('无法找到"添加操作"行'); return; }
        const opSelect = addOpRow.querySelector('select');
        const addOpBtn = addOpRow.querySelector('button.add-operation');
        if (!opSelect || !addOpBtn) { alert('无法找到"添加操作"按钮，请刷新重试'); return; }
        ops.forEach((opKey, idx) => {
            const optionExists = Array.from(opSelect.options).some(o => o.value === opKey);
            if (!optionExists) return;
            opSelect.value = opKey;
            opSelect.dispatchEvent(new Event('change', { bubbles: true }));
            addOpBtn.click();
            setTimeout(() => fillOpParams(adminPanel, opKey, preset), 130 * (idx + 1));
        });
        const lbl = section.querySelector('.ns-custom-preset-label');
        const orig = '自定义预设：';
        lbl.textContent = '\u2705 已应用「' + preset.name + '」';
        lbl.style.color = '#5cb85c';
        setTimeout(() => { lbl.textContent = orig; lbl.style.color = ''; }, 2000);
    }

    function findAddOpRow(adminPanel) {
        for (const child of adminPanel.children) {
            const btn = child.querySelector('button.add-operation');
            if (btn && btn.textContent.trim() === '添加操作') return child;
        }
        return null;
    }

    function buildOpsFromPreset(preset) {
        const ops = [];
        if (preset.coin_diff && preset.coin_diff !== 0) ops.push('coin');
        if (preset.stardust_diff && preset.stardust_diff !== 0) ops.push('stardust');
        return ops;
    }

    function fillOpParams(adminPanel, opKey, preset) {
        const optItems = adminPanel.querySelectorAll('.opt-item');
        const keyMatch = OP_KEY_MATCH[opKey] || [];
        let item = null;
        for (let i = optItems.length - 1; i >= 0; i--) {
            const oi = optItems[i];
            if (oi.dataset.nsPresetFilled) continue;
            const titleSpan = oi.querySelector('.title-name');
            if (titleSpan && keyMatch.some(k => titleSpan.textContent.trim().includes(k))) {
                item = oi; break;
            }
        }
        if (!item) {
            for (let i = optItems.length - 1; i >= 0; i--) {
                if (!optItems[i].dataset.nsPresetFilled) { item = optItems[i]; break; }
            }
        }
        if (!item) return;
        item.dataset.nsPresetFilled = '1';
        const detail = item.querySelector('.detail');
        if (!detail) return;

        switch (opKey) {
            case 'coin': {
                const reasonInput = detail.querySelector('input[name="title"]');
                if (reasonInput && preset.reason) setNativeValue(reasonInput, preset.reason);
                const sign = (preset.coin_diff || 0) > 0 ? 'add' : 'sub';
                const abs = Math.abs(preset.coin_diff || 0);
                const radioAdd = detail.querySelector('input[name="leg-add-sub"][value="add"]');
                const radioSub = detail.querySelector('input[name="leg-add-sub"][value="sub"]');
                if (sign === 'add' && radioAdd) triggerRadio(radioAdd);
                if (sign === 'sub' && radioSub) triggerRadio(radioSub);
                const numInput = detail.querySelector('input[name="leg"]');
                if (numInput) setNativeValue(numInput, abs);
                break;
            }
            case 'stardust': {
                const sign = (preset.stardust_diff || 0) > 0 ? 'add' : 'sub';
                const abs = Math.abs(preset.stardust_diff || 0);
                const radioAdd = detail.querySelector('input[name="stardust-add-sub"][value="add"]');
                const radioSub = detail.querySelector('input[name="stardust-add-sub"][value="sub"]');
                if (sign === 'add' && radioAdd) triggerRadio(radioAdd);
                if (sign === 'sub' && radioSub) triggerRadio(radioSub);
                const numInput = detail.querySelector('input[name="leg"]');
                if (numInput) setNativeValue(numInput, abs);
                break;
            }
            case 'award': {
                const val = preset.award_value !== undefined ? preset.award_value : 'true';
                const radio = detail.querySelector('input[name="award-post"][value="' + val + '"]');
                if (radio) triggerRadio(radio);
                break;
            }
            case 'lockDiscussion': {
                const val = preset.lock_value || 'lock';
                const radio = detail.querySelector('input[name="lock-post"][value="' + val + '"]');
                if (radio) triggerRadio(radio);
                break;
            }
            case 'suspend': {
                const val = preset.suspend_value !== undefined ? preset.suspend_value : 'true';
                const radio = detail.querySelector('input[name="suspend-member"][value="' + val + '"]');
                if (radio) triggerRadio(radio);
                const days = preset.suspend_days || 1;
                const numInput = detail.querySelector('input[name="leg"]');
                if (numInput) setNativeValue(numInput, days);
                break;
            }
            case 'hideComment': {
                const val = preset.hide_value !== undefined ? preset.hide_value : 'true';
                const radio = detail.querySelector('input[name="hide-comment"][value="' + val + '"]');
                if (radio) triggerRadio(radio);
                break;
            }
            case 'changeRank': {
                const val = preset.rank_value !== undefined ? String(preset.rank_value) : '0';
                const sel = detail.querySelector('select');
                if (sel) { sel.value = val; sel.dispatchEvent(new Event('change', { bubbles: true })); }
                break;
            }
            case 'changeTitle': {
                const titleInput = detail.querySelector('input[name="title"], input[type="text"]');
                if (titleInput && preset.new_title) setNativeValue(titleInput, preset.new_title);
                break;
            }
            case 'changeCategory': {
                const val = preset.category_value || '';
                const sel = detail.querySelector('select');
                if (sel && val) { sel.value = val; sel.dispatchEvent(new Event('change', { bubbles: true })); }
                break;
            }
        }
    }

    function setNativeValue(el, value) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function triggerRadio(el) {
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function openPresetManager(adminPanel, selectEl) {
        document.querySelectorAll('.ns-preset-manager-overlay').forEach(e => e.remove());
        const overlay = document.createElement('div');
        overlay.className = 'ns-preset-manager-overlay';
        let categoryOptionsHtml = '';
        for (const [val, text] of Object.entries(CATEGORY_OPTIONS)) {
            categoryOptionsHtml += '<option value="' + val + '">' + text + '</option>';
        }
        let rankOptionsHtml = '';
        for (const [val, text] of Object.entries(RANK_OPTIONS)) {
            rankOptionsHtml += '<option value="' + val + '">' + text + '</option>';
        }
        const modal = document.createElement('div');
        modal.className = 'ns-preset-manager-modal';
        modal.innerHTML = '<h3>\u2699 管理自定义预设</h3>'
            + '<div id="ns-preset-list" class="ns-preset-list"></div>'
            + '<button class="ns-btn-add-preset" id="ns-add-preset-toggle">+ 新增预设</button>'
            + '<div class="ns-preset-add-form" id="ns-add-preset-form" style="display:none;">'
            + '<h4 id="ns-form-title">新增预设</h4>'
            + '<input type="hidden" id="ns-edit-index" value="-1" />'
            + '<div class="ns-form-row"><label>预设名称</label><input type="text" id="ns-new-name" placeholder="如：广告处理" /></div>'
            + '<div class="ns-form-row"><label>理由</label><input type="text" id="ns-new-reason" placeholder="自动填入鸡腿操作的理由" /></div>'
            + '<div class="ns-form-row"><label>鸡腿变化</label><input type="number" id="ns-new-coin" placeholder="正数加，负数减，0不操作" value="0" /></div>'
            + '<div class="ns-form-row"><label>星辰变化</label><input type="number" id="ns-new-stardust" placeholder="正数加，负数减，0不操作" value="0" /></div>'
            + '<div class="ns-form-row"><label>额外操作</label><div class="ns-op-checkboxes" id="ns-new-ops">'
            + '<label><input type="checkbox" value="suspend"> 禁止发言</label>'
            + '<label><input type="checkbox" value="lockDiscussion"> 锁定帖子</label>'
            + '<label><input type="checkbox" value="hideComment"> 隐藏内容</label>'
            + '<label><input type="checkbox" value="award"> 推荐阅读</label>'
            + '<label><input type="checkbox" value="changeRank"> 修改阅读权限</label>'
            + '<label><input type="checkbox" value="changeTitle"> 修改标题</label>'
            + '<label><input type="checkbox" value="changeCategory"> 修改类别</label>'
            + '</div></div>'
            + '<div class="ns-form-row" id="ns-new-suspend-row" style="display:none;"><label>禁言天数</label><input type="number" id="ns-new-suspend-days" value="1" min="1" /></div>'
            + '<div class="ns-form-row" id="ns-new-lock-row" style="display:none;"><label>锁定操作</label><select class="ns-form-select" id="ns-new-lock-value"><option value="lock">锁定</option><option value="unlock">解锁</option></select></div>'
            + '<div class="ns-form-row" id="ns-new-award-row" style="display:none;"><label>推荐阅读</label><select class="ns-form-select" id="ns-new-award-value"><option value="true">是</option><option value="false">否</option></select></div>'
            + '<div class="ns-form-row" id="ns-new-hide-row" style="display:none;"><label>隐藏内容</label><select class="ns-form-select" id="ns-new-hide-value"><option value="true">是</option><option value="false">否</option></select></div>'
            + '<div class="ns-form-row" id="ns-new-rank-row" style="display:none;"><label>阅读权限</label><select class="ns-form-select" id="ns-new-rank-value">' + rankOptionsHtml + '</select></div>'
            + '<div class="ns-form-row" id="ns-new-category-row" style="display:none;"><label>目标类别</label><select class="ns-form-select" id="ns-new-category-value">' + categoryOptionsHtml + '</select></div>'
            + '<div class="ns-form-row" id="ns-new-title-row" style="display:none;"><label>新标题</label><input type="text" id="ns-new-title-value" placeholder="新的帖子标题" /></div>'
            + '<div class="ns-form-row" style="justify-content:flex-end">'
            + '<button class="ns-btn-primary" id="ns-save-new-preset">保存预设</button>'
            + '<button class="ns-btn-cancel-edit" id="ns-cancel-edit" style="display:none;">取消编辑</button>'
            + '</div>'
            + '</div>'
            + '<div class="ns-modal-footer">'
            + '<button class="ns-btn-primary" id="ns-preset-save-all">保存并关闭</button>'
            + '<button class="ns-btn-secondary" id="ns-preset-reset">恢复默认</button>'
            + '<button class="ns-btn-secondary" id="ns-preset-cancel">取消</button>'
            + '</div>';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const opParamMapping = {
            'suspend':'ns-new-suspend-row','lockDiscussion':'ns-new-lock-row',
            'award':'ns-new-award-row','hideComment':'ns-new-hide-row',
            'changeRank':'ns-new-rank-row','changeCategory':'ns-new-category-row',
            'changeTitle':'ns-new-title-row'
        };

        modal.querySelectorAll('#ns-new-ops input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const rowId = opParamMapping[cb.value];
                if (rowId) { modal.querySelector('#' + rowId).style.display = cb.checked ? 'flex' : 'none'; }
            });
        });

        // =============================================
        // 重置表单到新增模式
        // =============================================
        function resetFormToAddMode() {
            modal.querySelector('#ns-form-title').textContent = '新增预设';
            modal.querySelector('#ns-edit-index').value = '-1';
            modal.querySelector('#ns-new-name').value = '';
            modal.querySelector('#ns-new-reason').value = '';
            modal.querySelector('#ns-new-coin').value = '0';
            modal.querySelector('#ns-new-stardust').value = '0';
            modal.querySelectorAll('#ns-new-ops input[type="checkbox"]').forEach(cb => { cb.checked = false; });
            Object.values(opParamMapping).forEach(rowId => { modal.querySelector('#' + rowId).style.display = 'none'; });
            modal.querySelector('#ns-new-suspend-days').value = '1';
            modal.querySelector('#ns-new-lock-value').value = 'lock';
            modal.querySelector('#ns-new-award-value').value = 'true';
            modal.querySelector('#ns-new-hide-value').value = 'true';
            modal.querySelector('#ns-new-rank-value').value = '0';
            modal.querySelector('#ns-new-category-value').value = 'daily';
            const titleValEl = modal.querySelector('#ns-new-title-value');
            if (titleValEl) titleValEl.value = '';
            modal.querySelector('#ns-cancel-edit').style.display = 'none';
            modal.querySelector('#ns-save-new-preset').textContent = '保存预设';
            const form = modal.querySelector('#ns-add-preset-form');
            form.classList.remove('ns-editing');
            modal.querySelector('#ns-add-preset-toggle').textContent = '+ 新增预设';
        }

        // =============================================
        // 填充表单为编辑模式
        // =============================================
        function fillFormForEdit(preset, index) {
            const form = modal.querySelector('#ns-add-preset-form');
            form.style.display = 'block';
            form.classList.add('ns-editing');
            modal.querySelector('#ns-form-title').textContent = '编辑预设：' + preset.name;
            modal.querySelector('#ns-edit-index').value = String(index);
            modal.querySelector('#ns-new-name').value = preset.name || '';
            modal.querySelector('#ns-new-reason').value = preset.reason || '';
            modal.querySelector('#ns-new-coin').value = String(preset.coin_diff || 0);
            modal.querySelector('#ns-new-stardust').value = String(preset.stardust_diff || 0);

            // 重置所有 checkbox 和参数行
            modal.querySelectorAll('#ns-new-ops input[type="checkbox"]').forEach(cb => { cb.checked = false; });
            Object.values(opParamMapping).forEach(rowId => { modal.querySelector('#' + rowId).style.display = 'none'; });

            // 勾选额外操作并填充参数
            const ops = preset.operations || [];
            ops.filter(op => !['coin','stardust'].includes(op)).forEach(op => {
                const cb = modal.querySelector('#ns-new-ops input[value="' + op + '"]');
                if (cb) {
                    cb.checked = true;
                    const rowId = opParamMapping[op];
                    if (rowId) modal.querySelector('#' + rowId).style.display = 'flex';
                }
            });

            // 填充各操作的参数值
            if (preset.suspend_days !== undefined) modal.querySelector('#ns-new-suspend-days').value = String(preset.suspend_days);
            if (preset.lock_value) modal.querySelector('#ns-new-lock-value').value = preset.lock_value;
            if (preset.award_value !== undefined) modal.querySelector('#ns-new-award-value').value = String(preset.award_value);
            if (preset.hide_value !== undefined) modal.querySelector('#ns-new-hide-value').value = String(preset.hide_value);
            if (preset.rank_value !== undefined) modal.querySelector('#ns-new-rank-value').value = String(preset.rank_value);
            if (preset.category_value) modal.querySelector('#ns-new-category-value').value = preset.category_value;
            const titleValEl = modal.querySelector('#ns-new-title-value');
            if (titleValEl && preset.new_title) titleValEl.value = preset.new_title;

            modal.querySelector('#ns-cancel-edit').style.display = 'inline-block';
            modal.querySelector('#ns-save-new-preset').textContent = '保存修改';
            modal.querySelector('#ns-add-preset-toggle').textContent = '+ 新增预设（取消当前编辑）';

            // 滚动到表单位置
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // =============================================
        // 从表单收集预设数据（新增和编辑共用）
        // =============================================
        function collectPresetFromForm() {
            const name = modal.querySelector('#ns-new-name').value.trim();
            const reason = modal.querySelector('#ns-new-reason').value.trim();
            const coin = parseInt(modal.querySelector('#ns-new-coin').value) || 0;
            const stardust = parseInt(modal.querySelector('#ns-new-stardust').value) || 0;
            if (!name) { alert('请填写预设名称'); return null; }
            const extraOps = [];
            modal.querySelectorAll('#ns-new-ops input[type="checkbox"]:checked').forEach(cb => extraOps.push(cb.value));
            const operations = [];
            if (coin !== 0) operations.push('coin');
            if (stardust !== 0) operations.push('stardust');
            extraOps.forEach(op => { if (!operations.includes(op)) operations.push(op); });
            const preset = {
                name: name,
                reason: reason || name,
                coin_diff: coin,
                stardust_diff: stardust,
                operations: operations.length > 0 ? operations : ['coin']
            };
            if (extraOps.includes('suspend')) { preset.suspend_value = 'true'; preset.suspend_days = parseInt(modal.querySelector('#ns-new-suspend-days').value) || 1; }
            if (extraOps.includes('lockDiscussion')) { preset.lock_value = modal.querySelector('#ns-new-lock-value').value; }
            if (extraOps.includes('award')) { preset.award_value = modal.querySelector('#ns-new-award-value').value; }
            if (extraOps.includes('hideComment')) { preset.hide_value = modal.querySelector('#ns-new-hide-value').value; }
            if (extraOps.includes('changeRank')) { preset.rank_value = modal.querySelector('#ns-new-rank-value').value; }
            if (extraOps.includes('changeCategory')) { preset.category_value = modal.querySelector('#ns-new-category-value').value; }
            if (extraOps.includes('changeTitle')) {
                const tv = modal.querySelector('#ns-new-title-value');
                if (tv) preset.new_title = tv.value.trim();
            }
            return preset;
        }

        renderPresetList(modal, fillFormForEdit);

        // 新增/编辑切换按钮
        modal.querySelector('#ns-add-preset-toggle').addEventListener('click', () => {
            const form = modal.querySelector('#ns-add-preset-form');
            const isEditing = modal.querySelector('#ns-edit-index').value !== '-1';
            if (isEditing) {
                // 正在编辑时点击，取消编辑并切换到新增模式
                resetFormToAddMode();
                form.style.display = 'block';
            } else {
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
            }
        });

        // 取消编辑按钮
        modal.querySelector('#ns-cancel-edit').addEventListener('click', () => {
            resetFormToAddMode();
            modal.querySelector('#ns-add-preset-form').style.display = 'none';
        });

        // 保存按钮（新增或编辑）
        modal.querySelector('#ns-save-new-preset').addEventListener('click', () => {
            const presetData = collectPresetFromForm();
            if (!presetData) return;
            const editIndex = parseInt(modal.querySelector('#ns-edit-index').value);
            const presets = loadCustomPresets();

            if (editIndex >= 0 && editIndex < presets.length) {
                // 编辑模式：保留原 key，更新其他字段
                const oldKey = presets[editIndex].key;
                presetData.key = oldKey;
                presets[editIndex] = presetData;
            } else {
                // 新增模式
                presetData.key = 'custom_' + Date.now();
                presets.push(presetData);
            }
            saveCustomPresets(presets);
            resetFormToAddMode();
            modal.querySelector('#ns-add-preset-form').style.display = 'none';
            renderPresetList(modal, fillFormForEdit);
        });

        modal.querySelector('#ns-preset-save-all').addEventListener('click', () => { overlay.remove(); rebuildSelectOptions(selectEl, loadCustomPresets()); });
        modal.querySelector('#ns-preset-reset').addEventListener('click', () => {
            if (confirm('确定要恢复为默认的三个官方预设吗？自定义预设将全部清除。')) {
                saveCustomPresets(JSON.parse(JSON.stringify(DEFAULT_CUSTOM_PRESETS)));
                resetFormToAddMode();
                modal.querySelector('#ns-add-preset-form').style.display = 'none';
                renderPresetList(modal, fillFormForEdit);
            }
        });
        modal.querySelector('#ns-preset-cancel').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    }

    function renderPresetList(modal, onEditCallback) {
        const container = modal.querySelector('#ns-preset-list');
        const presets = loadCustomPresets();
        container.innerHTML = '';
        if (presets.length === 0) {
            container.innerHTML = '<div style="color:#999;text-align:center;padding:16px;">暂无预设，点击"+ 新增预设"添加</div>';
            return;
        }
        presets.forEach((preset, index) => {
            const item = document.createElement('div');
            item.className = 'ns-preset-item';
            let badges = '';
            if (preset.coin_diff > 0) badges += '<span class="ns-badge ns-badge-coin-pos">鸡腿 +' + preset.coin_diff + '</span>';
            if (preset.coin_diff < 0) badges += '<span class="ns-badge ns-badge-coin-neg">鸡腿 ' + preset.coin_diff + '</span>';
            if (preset.stardust_diff > 0) badges += '<span class="ns-badge ns-badge-star-pos">星辰 +' + preset.stardust_diff + '</span>';
            if (preset.stardust_diff < 0) badges += '<span class="ns-badge ns-badge-star-neg">星辰 ' + preset.stardust_diff + '</span>';
            const ops = preset.operations || buildOpsFromPreset(preset);
            ops.filter(op => !['coin','stardust'].includes(op)).forEach(op => {
                let opLabel = OP_LABELS[op] || op;
                if (op === 'suspend' && preset.suspend_days) opLabel += ' ' + preset.suspend_days + '天';
                if (op === 'lockDiscussion' && preset.lock_value === 'unlock') opLabel = '解锁帖子';
                if (op === 'award' && preset.award_value === 'false') opLabel = '取消推荐';
                if (op === 'hideComment' && preset.hide_value === 'false') opLabel = '取消隐藏';
                if (op === 'changeRank' && preset.rank_value !== undefined) opLabel += ' \u2192 ' + (RANK_OPTIONS[String(preset.rank_value)] || preset.rank_value);
                if (op === 'changeCategory' && preset.category_value) opLabel += ' \u2192 ' + (CATEGORY_OPTIONS[preset.category_value] || preset.category_value);
                if (op === 'changeTitle' && preset.new_title) opLabel += ' \u2192 ' + preset.new_title.substring(0, 10);
                badges += '<span class="ns-badge ns-badge-op">' + opLabel + '</span>';
            });
            item.innerHTML = '<div class="ns-preset-item-header">'
                + '<span class="ns-preset-item-name">' + preset.name + '</span>'
                + '<div class="ns-preset-item-badges">' + badges + '</div>'
                + '<button class="ns-preset-item-edit" data-index="' + index + '">编辑</button>'
                + '<button class="ns-preset-item-del" data-index="' + index + '">删除</button>'
                + '</div>'
                + '<div class="ns-preset-item-reason">理由：' + (preset.reason || '（未设置）') + '</div>';
            item.querySelector('.ns-preset-item-edit').addEventListener('click', () => {
                if (typeof onEditCallback === 'function') {
                    onEditCallback(preset, index);
                }
            });
            item.querySelector('.ns-preset-item-del').addEventListener('click', () => {
                if (confirm('确定要删除预设「' + preset.name + '」吗？')) {
                    const p = loadCustomPresets();
                    p.splice(index, 1);
                    saveCustomPresets(p);
                    renderPresetList(modal, onEditCallback);
                }
            });
            container.appendChild(item);
        });
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.classList && node.classList.contains('admin-panel')) {
                    setTimeout(() => injectCustomPresets(node), 200);
                }
                const panel = node.querySelector && node.querySelector('.admin-panel');
                if (panel) setTimeout(() => injectCustomPresets(panel), 200);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const existingPanel = document.querySelector('.admin-panel');
    if (existingPanel) setTimeout(() => injectCustomPresets(existingPanel), 300);
})();