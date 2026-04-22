// API 收藏夹应用
class ApiCollection {
  constructor() {
    this.apiList = JSON.parse(localStorage.getItem('apiCollection')) || this.getDefaultApiList();
    this.tagList = JSON.parse(localStorage.getItem('apiTags')) || this.getDefaultTagList();
    this.currentView = 'card';
    this.currentTag = '全部';
    this.currentEditingId = null;
    this.init();
  }

  // 默认标签列表
  getDefaultTagList() {
    return [
      { id: '1', name: 'GitHub', color: 'var(--accent)' },
      { id: '2', name: '天气', color: 'var(--green)' },
      { id: '3', name: '翻译', color: 'var(--purple)' },
      { id: '4', name: '大模型', color: 'var(--orange)' },
      { id: '5', name: '免费', color: 'var(--pink)' },
      { id: '6', name: '认证', color: 'var(--yellow)' }
    ];
  }

  // 默认API数据
  getDefaultApiList() {
    return [
      {
        id: '1',
        title: 'GitHub 获取用户信息',
        method: 'GET',
        url: 'api.github.com/users/{username}',
        key: 'ghp_xR7kM2nQ9wL4vB8jF3cD6eA1sH5',
        tags: ['GitHub', '免费'],
        desc: '获取 GitHub 用户的公开资料信息，包括头像、简介、公开仓库数量等。需设置 User-Agent 请求头。',
        docs: 'https://docs.github.com/rest/users'
      },
      {
        id: '2',
        title: '查询城市实时天气',
        method: 'GET',
        url: 'api.weather.com/v1/current?city=beijing&units=metric',
        key: 'wx_a8b3c7d9e2f45610',
        tags: ['天气', '免费'],
        desc: '获取指定城市的实时天气数据，包括温度、湿度、风速、天气状况等。支持中英文城市名。',
        docs: 'https://weather.com/dev/docs'
      },
      {
        id: '3',
        title: 'DeepSeek 对话补全',
        method: 'POST',
        url: 'api.deepseek.com/v1/chat/completions',
        key: 'sk-ds7f9g2h4k6m8n0p1q3r5t',
        tags: ['大模型'],
        desc: 'DeepSeek 大语言模型对话接口，兼容 OpenAI 格式。支持流式输出和多轮对话。',
        docs: 'https://platform.deepseek.com/api-docs'
      },
      {
        id: '4',
        title: 'Google 翻译 API',
        method: 'POST',
        url: 'translation.googleapis.com/language/translate/v2',
        key: 'AIzaSyB7xN9mK3pQ2wR8vT5jL1cF4hD',
        tags: ['翻译', '免费'],
        desc: 'Google 翻译接口，支持 100+ 语言互译。需配置 API Key，每月有免费额度。',
        docs: 'https://cloud.google.com/translate/docs'
      },
      {
        id: '5',
        title: 'GitHub 搜索仓库',
        method: 'GET',
        url: 'api.github.com/search/repositories?q={query}&sort=stars',
        key: 'ghp_xR7kM2nQ9wL4vB8jF3cD6eA1sH5',
        tags: ['GitHub', '免费'],
        desc: '搜索 GitHub 仓库，支持按关键词、语言、星标数等条件排序和过滤。',
        docs: 'https://docs.github.com/rest/search'
      },
      {
        id: '6',
        title: 'OpenAI 图像生成',
        method: 'POST',
        url: 'api.openai.com/v1/images/generations',
        key: 'sk-proj-aB3cD5eF7gH9iJ1kL3mN5',
        tags: ['大模型'],
        desc: '根据文本描述生成图像，支持 DALL-E 3 模型。返回图片 URL 或 Base64 数据。',
        docs: 'https://platform.openai.com/docs/api-reference/images'
      }
    ];
  }

  // 初始化应用
  init() {
    this.renderApiList();
    this.renderTagList();
    this.bindEvents();
    this.updateStats();
    this.updateTagCounts();
  }

  // 绑定事件
  bindEvents() {
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchApi(e.target.value);
    });

    // 导入导出按钮
    document.getElementById('importBtn').addEventListener('click', () => this.importData());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

    // 新增 API 按钮
    document.getElementById('addApiBtn').addEventListener('click', () => this.openModal());

    // 新建标签按钮
    document.getElementById('newTagBtn').addEventListener('click', () => this.openTagModal());

    // 颜色选择器事件
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-option')) {
        document.querySelectorAll('.color-option').forEach(option => option.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('tagColor').value = e.target.dataset.color;
      }
    });
  }

  // 打开标签模态框
  openTagModal() {
    document.getElementById('tagModal').classList.add('active');
    document.getElementById('tagForm').reset();
    document.getElementById('tagColor').value = 'var(--accent)';
    document.querySelectorAll('.color-option').forEach(option => {
      if (option.dataset.color === 'var(--accent)') {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  // 关闭标签模态框
  closeTagModal() {
    document.getElementById('tagModal').classList.remove('active');
  }

  // 保存标签
  saveTag() {
    const tagName = document.getElementById('tagName').value.trim();
    const tagColor = document.getElementById('tagColor').value;
    const tagDesc = document.getElementById('tagDesc').value.trim();

    if (!tagName) {
      this.showToast('warning', '请输入标签名称');
      return;
    }

    // 检查标签是否已存在
    if (this.tagList.some(tag => tag.name === tagName)) {
      this.showToast('warning', '标签名称已存在');
      return;
    }

    // 创建新标签
    const newTag = {
      id: Date.now().toString(),
      name: tagName,
      color: tagColor,
      desc: tagDesc
    };

    // 添加到标签列表
    this.tagList.push(newTag);
    this.saveTags();
    this.renderTagList();
    this.updateTagCounts();

    this.showToast('success', `标签 "${tagName}" 已创建`);
    this.closeTagModal();
  }

  // 移动API
  moveApi(apiId) {
    this.currentEditingId = apiId;
    const api = this.apiList.find(item => item.id === apiId);
    if (!api) return;

    // 打开移动模态框
    document.getElementById('moveApiId').value = apiId;
    document.getElementById('moveModal').classList.add('active');

    // 渲染标签选择器
    this.renderTagSelector(api.tags);
  }

  // 渲染标签选择器
  renderTagSelector(currentTags) {
    const tagSelector = document.getElementById('tagSelector');
    tagSelector.innerHTML = '';

    this.tagList.forEach(tag => {
      const isSelected = currentTags.includes(tag.name);
      const tagOption = document.createElement('div');
      tagOption.className = `tag-option ${isSelected ? 'selected' : ''}`;
      tagOption.dataset.tagName = tag.name;
      tagOption.onclick = () => {
        tagOption.classList.toggle('selected');
      };
      tagOption.innerHTML = `
        <div class="tag-dot" style="background:${tag.color}"></div>
        ${tag.name}
      `;
      tagSelector.appendChild(tagOption);
    });
  }

  // 确认移动
  confirmMove() {
    const apiId = document.getElementById('moveApiId').value;
    const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected')).map(option => option.dataset.tagName);
    const moveType = document.querySelector('input[name="moveType"]:checked').value;

    if (selectedTags.length === 0) {
      this.showToast('warning', '请选择至少一个标签');
      return;
    }

    const api = this.apiList.find(item => item.id === apiId);
    if (api) {
      if (moveType === 'move') {
        // 移动：替换标签
        api.tags = selectedTags;
      } else {
        // 添加：合并标签
        const newTags = [...new Set([...api.tags, ...selectedTags])];
        api.tags = newTags;
      }

      this.saveData();
      this.renderApiList();
      this.updateTagCounts();
      this.showToast('success', 'API 已移动到所选标签');
      this.closeMoveModal();
    }
  }

  // 关闭移动模态框
  closeMoveModal() {
    document.getElementById('moveModal').classList.remove('active');
    this.currentEditingId = null;
  }

  // 保存标签到本地存储
  saveTags() {
    localStorage.setItem('apiTags', JSON.stringify(this.tagList));
  }

  // 渲染标签列表
  renderTagList() {
    const tagChildren = document.querySelector('.tag-children');
    if (!tagChildren) return;
    
    // 保留"全部"标签，移除其他标签
    const allTagItem = tagChildren.querySelector('.tag-item:first-child');
    tagChildren.innerHTML = '';
    
    // 确保"全部"标签存在
    if (allTagItem) {
      tagChildren.appendChild(allTagItem);
    } else {
      // 如果"全部"标签不存在，创建一个
      const newAllTagItem = document.createElement('div');
      newAllTagItem.className = 'tag-item active';
      newAllTagItem.onclick = () => this.selectTag(newAllTagItem);
      newAllTagItem.innerHTML = `
        <div class="tag-item-left">
          <div class="tag-dot" style="background:var(--text-muted)"></div>
          全部
        </div>
        <span class="tag-count">0</span>
      `;
      tagChildren.appendChild(newAllTagItem);
    }

    // 添加所有标签
    this.tagList.forEach(tag => {
      const tagItem = document.createElement('div');
      tagItem.className = 'tag-item';
      tagItem.onclick = () => this.selectTag(tagItem);
      tagItem.innerHTML = `
        <div class="tag-item-left">
          <div class="tag-dot" style="background:${tag.color}"></div>
          ${tag.name}
        </div>
        <span class="tag-count">0</span>
      `;
      tagChildren.appendChild(tagItem);
    });
  }

  // 保存数据到本地存储
  saveData() {
    localStorage.setItem('apiCollection', JSON.stringify(this.apiList));
    this.updateStats();
    this.updateTagCounts();
  }

  // 更新统计信息
  updateStats() {
    const totalCount = this.apiList.length;
    document.querySelector('.stat-chip .num').textContent = totalCount;
    document.querySelector('.filter-label span').textContent = totalCount;
  }

  // 渲染 API 列表
  renderApiList(filteredList = null) {
    const listToRender = filteredList || this.apiList;
    this.renderCardView(listToRender);
    this.renderTableView(listToRender);
  }

  // 渲染卡片视图
  renderCardView(apiList) {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '';

    apiList.forEach((api, index) => {
      const card = this.createApiCard(api, index);
      cardView.appendChild(card);
    });
  }

  // 渲染表格视图
  renderTableView(apiList) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    apiList.forEach(api => {
      const row = this.createApiTableRow(api);
      tableBody.appendChild(row);
    });
  }

  // 创建 API 卡片
  createApiCard(api, index) {
    const card = document.createElement('div');
    card.className = 'api-card';
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div class="card-top">
        <div class="card-title">${api.title}</div>
        <div class="card-actions">
          <button class="card-action-btn" title="复制 URL" onclick="apiCollection.copyUrl('${api.url}')"><i class="fas fa-copy"></i></button>
          <button class="card-action-btn" title="移动" onclick="apiCollection.moveApi('${api.id}')"><i class="fas fa-arrows-alt"></i></button>
          <button class="card-action-btn" title="编辑" onclick="apiCollection.editApi('${api.id}')"><i class="fas fa-pen"></i></button>
          <button class="card-action-btn danger" title="删除" onclick="apiCollection.deleteApi('${api.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="method-url">
        <span class="method-badge ${api.method.toLowerCase()}">${api.method}</span>
        <span class="url-text">${api.url}</span>
      </div>
      <div class="card-tags">
        ${api.tags.map(tag => `<span class="card-tag ${this.getTagClass(tag)}">${tag}</span>`).join('')}
      </div>
      ${api.key ? `
        <div class="card-apikey">
          <i class="fas fa-key apikey-icon"></i>
          <span class="apikey-label">Key:</span>
          <span class="apikey-value" data-real="${api.key}">••••••••••••••</span>
          <div class="apikey-actions">
            <button title="显示/隐藏" onclick="apiCollection.toggleCardKey(this)"><i class="fas fa-eye-slash"></i></button>
            <button title="复制 Key" onclick="apiCollection.copyKey('${api.key}')"><i class="fas fa-copy"></i></button>
            <button title="编辑 Key" onclick="apiCollection.editApi('${api.id}')"><i class="fas fa-pen"></i></button>
          </div>
        </div>
      ` : ''}
      <div class="card-desc">${api.desc}</div>
      <div class="card-source">
        <i class="fas fa-link"></i>
        <a href="${api.docs}" target="_blank">${this.getDomainFromUrl(api.docs)}</a>
      </div>
    `;

    return card;
  }

  // 创建表格行
  createApiTableRow(api) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="table-title">${api.title}</td>
      <td class="table-url"><span class="method-badge ${api.method.toLowerCase()}" style="font-size:9px;padding:1px 6px">${api.method}</span> ${api.url}</td>
      <td>
        <div class="card-apikey" style="margin-bottom:0;padding:5px 10px;font-size:11px">
          <i class="fas fa-key apikey-icon" style="font-size:10px"></i>
          <span class="apikey-value" data-real="${api.key}">••••••••••</span>
          <div class="apikey-actions">
            <button title="显示/隐藏" onclick="apiCollection.toggleCardKey(this)" style="width:22px;height:22px"><i class="fas fa-eye-slash"></i></button>
            <button title="复制" onclick="apiCollection.copyKey('${api.key}')" style="width:22px;height:22px"><i class="fas fa-copy"></i></button>
          </div>
        </div>
      </td>
      <td>
        <div class="table-tags">
          ${api.tags.map(tag => `<span class="card-tag ${this.getTagClass(tag)}">${tag}</span>`).join('')}
        </div>
      </td>
      <td><a href="${api.docs}" target="_blank" style="color:var(--text-muted);text-decoration:none;font-size:12px">${this.getDomainFromUrl(api.docs)}</a></td>
      <td>
        <div class="table-actions">
          <button class="card-action-btn" onclick="apiCollection.copyUrl('${api.url}')"><i class="fas fa-copy"></i></button>
          <button class="card-action-btn" onclick="apiCollection.moveApi('${api.id}')"><i class="fas fa-arrows-alt"></i></button>
          <button class="card-action-btn" onclick="apiCollection.editApi('${api.id}')"><i class="fas fa-pen"></i></button>
          <button class="card-action-btn danger" onclick="apiCollection.deleteApi('${api.id}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;

    return row;
  }

  // 获取标签对应的CSS类
  getTagClass(tag) {
    const tagMap = {
      'GitHub': 'github',
      '天气': 'weather',
      '翻译': 'translate',
      '大模型': 'llm',
      '免费': 'free',
      '认证': 'auth'
    };
    return tagMap[tag] || '';
  }

  // 从URL中提取域名
  getDomainFromUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  }

  // 复制URL到剪贴板
  copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('success', 'URL 已复制到剪贴板');
    });
  }

  // 复制API Key到剪贴板
  copyKey(key) {
    navigator.clipboard.writeText(key).then(() => {
      this.showToast('success', 'API Key 已复制');
    });
  }

  // 切换API Key显示/隐藏
  toggleCardKey(button) {
    const keyElement = button.closest('.card-apikey').querySelector('.apikey-value');
    const isVisible = keyElement.classList.contains('visible');
    
    if (isVisible) {
      keyElement.textContent = '••••••••••••••';
      keyElement.classList.remove('visible');
      button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      keyElement.textContent = keyElement.dataset.real;
      keyElement.classList.add('visible');
      button.innerHTML = '<i class="fas fa-eye"></i>';
    }
  }

  // 打开模态框
  openModal(apiId = null) {
    const modal = document.getElementById('apiModal');
    const modalTitle = document.getElementById('modalTitle');
    const apiForm = document.getElementById('apiForm');
    
    if (apiId) {
      const api = this.apiList.find(item => item.id === apiId);
      if (api) {
        this.currentEditingId = apiId;
        modalTitle.textContent = '编辑 API';
        document.getElementById('apiId').value = api.id;
        document.getElementById('apiTitle').value = api.title;
        document.getElementById('apiMethod').value = api.method;
        document.getElementById('apiUrl').value = api.url;
        document.getElementById('apiKey').value = api.key;
        document.getElementById('apiTags').value = api.tags.join(', ');
        document.getElementById('apiDesc').value = api.desc;
        document.getElementById('apiDocs').value = api.docs;
      }
    } else {
      this.currentEditingId = null;
      modalTitle.textContent = '新增 API';
      apiForm.reset();
      document.getElementById('apiId').value = '';
    }
    
    modal.classList.add('active');
  }

  // 关闭模态框
  closeModal() {
    document.getElementById('apiModal').classList.remove('active');
  }

  // 保存API
  saveApi() {
    const form = document.getElementById('apiForm');
    const id = document.getElementById('apiId').value;
    const title = document.getElementById('apiTitle').value;
    const method = document.getElementById('apiMethod').value;
    const url = document.getElementById('apiUrl').value;
    const key = document.getElementById('apiKey').value;
    const tags = document.getElementById('apiTags').value.split(',').map(tag => tag.trim()).filter(Boolean);
    const desc = document.getElementById('apiDesc').value;
    const docs = document.getElementById('apiDocs').value;

    if (!title || !url) {
      this.showToast('warning', '请填写标题和URL');
      return;
    }

    if (id) {
      // 编辑现有API
      const index = this.apiList.findIndex(item => item.id === id);
      if (index !== -1) {
        this.apiList[index] = {
          ...this.apiList[index],
          title,
          method,
          url,
          key,
          tags,
          desc,
          docs
        };
        this.showToast('success', 'API 已更新');
      }
    } else {
      // 新增API
      const newApi = {
        id: Date.now().toString(),
        title,
        method,
        url,
        key,
        tags,
        desc,
        docs
      };
      this.apiList.push(newApi);
      this.showToast('success', 'API 已添加');
    }

    this.saveData();
    this.renderApiList();
    this.closeModal();
  }

  // 编辑API
  editApi(apiId) {
    this.openModal(apiId);
  }

  // 删除API
  deleteApi(apiId) {
    this.currentEditingId = apiId;
    document.getElementById('confirmModal').classList.add('active');
  }

  // 确认删除
  confirmDelete() {
    if (this.currentEditingId) {
      this.apiList = this.apiList.filter(item => item.id !== this.currentEditingId);
      this.saveData();
      this.renderApiList();
      this.showToast('success', 'API 已删除');
      this.closeConfirm();
    }
  }

  // 关闭确认弹窗
  closeConfirm() {
    document.getElementById('confirmModal').classList.remove('active');
    this.currentEditingId = null;
  }

  // 切换视图
  switchView(view, button) {
    this.currentView = view;
    
    // 更新按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // 切换视图显示
    if (view === 'card') {
      document.getElementById('cardView').classList.remove('hidden');
      document.getElementById('tableView').classList.remove('active');
    } else {
      document.getElementById('cardView').classList.add('hidden');
      document.getElementById('tableView').classList.add('active');
    }
  }

  // 切换树形菜单
  toggleTree(element) {
    const arrow = element.querySelector('.tree-arrow');
    const children = element.nextElementSibling;
    
    arrow.classList.toggle('expanded');
    children.classList.toggle('expanded');
  }

  // 选择标签
  selectTag(element) {
    // 更新标签激活状态
    document.querySelectorAll('.tag-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    
    // 获取选择的标签
    this.currentTag = element.querySelector('.tag-item-left').textContent.trim();
    
    // 过滤API列表
    if (this.currentTag === '全部') {
      this.renderApiList();
      document.querySelector('.filter-label span').textContent = this.apiList.length;
    } else {
      const filteredList = this.apiList.filter(api => api.tags.includes(this.currentTag));
      this.renderApiList(filteredList);
      document.querySelector('.filter-label span').textContent = filteredList.length;
    }
  }

  // 更新标签计数
  updateTagCounts() {
    const tagItems = document.querySelectorAll('.tag-item');
    tagItems.forEach(item => {
      const tagName = item.querySelector('.tag-item-left').textContent.trim();
      let count = 0;
      
      if (tagName === '全部') {
        count = this.apiList.length;
      } else {
        count = this.apiList.filter(api => api.tags.includes(tagName)).length;
      }
      
      item.querySelector('.tag-count').textContent = count;
    });
    
    // 更新全部API计数
    document.querySelector('.tag-parent .tag-count').textContent = this.apiList.length;
  }

  // 搜索API
  searchApi(query) {
    if (!query) {
      this.renderApiList();
      return;
    }

    const filteredList = this.apiList.filter(api => {
      const searchText = `${api.title} ${api.url} ${api.desc} ${api.tags.join(' ')}`;
      return searchText.toLowerCase().includes(query.toLowerCase());
    });

    this.renderApiList(filteredList);
    document.querySelector('.filter-label span').textContent = filteredList.length;
  }

  // 导入数据
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
              this.apiList = importedData;
              this.saveData();
              this.renderApiList();
              this.showToast('success', '数据导入成功');
            } else {
              this.showToast('warning', '导入的数据格式不正确');
            }
          } catch (error) {
            this.showToast('warning', '导入失败：无效的JSON文件');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  // 导出数据
  exportData() {
    const dataStr = JSON.stringify(this.apiList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast('success', '数据已导出');
  }

  // 显示Toast提示
  showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // 切换功能面板
  toggleFeatures() {
    const featuresPanel = document.getElementById('featuresPanel');
    featuresPanel.classList.toggle('open');
  }
}

// 全局实例
let apiCollection;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  apiCollection = new ApiCollection();
});

// 全局函数，供HTML调用
window.switchView = (view, button) => apiCollection.switchView(view, button);
window.toggleTree = (element) => apiCollection.toggleTree(element);
window.selectTag = (element) => apiCollection.selectTag(element);
window.openModal = () => apiCollection.openModal();
window.closeModal = () => apiCollection.closeModal();
window.saveApi = () => apiCollection.saveApi();
window.openConfirm = () => apiCollection.deleteApi(apiCollection.currentEditingId);
window.closeConfirm = () => apiCollection.closeConfirm();
window.confirmDelete = () => apiCollection.confirmDelete();
window.toggleFeatures = () => apiCollection.toggleFeatures();
window.toggleCardKey = (button) => apiCollection.toggleCardKey(button);
window.showToast = (type, message) => apiCollection.showToast(type, message);
window.openTagModal = () => apiCollection.openTagModal();
window.closeTagModal = () => apiCollection.closeTagModal();
window.saveTag = () => apiCollection.saveTag();
window.moveApi = (apiId) => apiCollection.moveApi(apiId);
window.confirmMove = () => apiCollection.confirmMove();
window.closeMoveModal = () => apiCollection.closeMoveModal();