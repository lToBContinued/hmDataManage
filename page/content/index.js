/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */
// 1.1 准备查询参数对象
const queryObj = {
  status: '',      // 文章的状态（1-待审核 2-审核通过 空字符串-全部）
  channel_id: '',  // 文章频道id， 空字符串-全部
  page: '1',       // 当前页码
  per_page: '2'     // 每页的条数
}
let totalCount = 0  // 保存文章总的条数

async function setArticleList() {
  // 1.2 获取文章列表数据
  const res = await axios({
    url: '/v1_0/mp/articles', params: queryObj
  })
  // console.log(res.data.results)
  // 1.3 展示到指定的标签结构中
  document.querySelector('.art-list').innerHTML = res.data.results.map(item => {
    return `
      <tr>
        <td>
          <img src="${item.cover.type === 0 ? '' : item.cover.images[0]}https://img2.baidu.com/it/u=2640406343,1419332367&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=708&amp;h=500" alt="">
        </td>
        <td>${item.title}</td>
        <td>
          ${item.status === 1 ? '<span class="badge text-bg-success">待审核</span>' : ''}
          ${item.status === 2 ? '<span class="badge text-bg-primary">审核通过</span>' : ''}
        </td>
        <td>
          <span>${item.pubdate}</span>
        </td>
        <td>
          <span>${item.read_count}</span>
        </td>
        <td>
          <span>${item.comment_count}</span>
        </td>
        <td>
          <span>${item.like_count}</span>
        </td>
        <td data-id="${item.id}">
          <i class="bi bi-pencil-square edit"></i>
          <i class="bi bi-trash3 del"></i>
        </td>
      </tr>`
  }).join('')
  // 3.1 保存并设置文章总条数
  totalCount = res.data.total_count
  document.querySelector('.total-count').innerHTML = `共 ${totalCount} 条`
}

setArticleList()

/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */
// 2.1 设置频道列表数据
async function setChannelList() {
  const res = await axios({url: '/v1_0/channels'})
  console.log(res.data.channels);
  // 1.2 展示到下拉菜单中
  const htmlStr = res.data.channels.map((item, index) => {
    return `<option value=${index + 1}>${item.name}</option>`
  }).join('')
  document.querySelector('.form-select').innerHTML = '<option value="" selected>请选择文章频道</option>' + htmlStr
}

// 网页运行后，默认调用一次
setChannelList()

// 2.2 监听筛选条件改变，保存查询信息到查询参数对象
// 筛选状态标记数字->change事件->绑定到查询参数对象上
document.querySelectorAll('.form-check-input').forEach(radio => {
  // console.log(radio)
  radio.addEventListener('change', e => {
    queryObj.status = e.target.value
  })
})
// 筛选频道的id->change事件->绑定到查询参数的对象
document.querySelector('.form-select').addEventListener('change', e => {
  queryObj.channel_id = e.target.value
})

// 2.3 点击筛选时，传递查询参数对象到服务器
document.querySelector('.sel-btn').addEventListener('click', () => {
  // 2.4 获取匹配数据，覆盖到页面展示
  setArticleList()
})

/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */
document.querySelector('.next').addEventListener('click', () => {
  // 当前页码小于最大的页码数
  if (queryObj.page < Math.ceil(totalCount / queryObj.per_page)) {
    queryObj.page++
    document.querySelector('.page-now').innerHTML = `第 ${queryObj.page} 页`
    setArticleList()
  }
})
document.querySelector('.last').addEventListener('click', () => {
  // 大于1的时候才能翻到上一页
  // console.log(11)
  if (1 < queryObj.page) {
    queryObj.page--
    document.querySelector('.page-now').innerHTML = `第 ${queryObj.page} 页`
    setArticleList()
  }
})

/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */
document.querySelector('.art-list').addEventListener('click', async e => {
  if (e.target.classList.contains('del')) {
    const delId = e.target.parentNode.dataset.id
    console.log(delId)
    // 4.3 调用删除接口，传递文章 id 到服务器
    await axios({
      url: `/v1_0/mp/articles/${delId}`, method: 'DELETE',
    })
    
    // 4.5 删除最后一页的最后一条，需要自动向前翻页
    const children = document.querySelector('.art-list').children
    if (children.length === 1 && queryObj.page !== 1) {
      queryObj.page--
      document.querySelector('.page-now').innerHTML = `第 ${queryObj.page} 页`
    }
    
    // 4.4 重新获取文章列表，并覆盖展示
    setArticleList()
  }
})

// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去
document.querySelector('.art-list').addEventListener('click', e => {
  if (e.target.classList.contains('edit')) {
    const artId = e.target.parentNode.dataset.id
    console.log(artId)
    location.href = `../publish/index.html?id=${artId}`
  }
})
