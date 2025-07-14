document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // 1. 所有变量和常量定义
    // ===================================================================
    const db = new Dexie('GeminiChatDB');
    // --- 已修正 ---
    let state = { chats: {}, activeChatId: null, globalSettings: {}, apiConfig: {}, userStickers: [], worldBooks: [], personaPresets: [], qzoneSettings: {}, activeAlbumId: null };
    // --- 修正结束 ---
    let musicState = { isActive: false, activeChatId: null, isPlaying: false, playlist: [], currentIndex: -1, playMode: 'order', totalElapsedTime: 0, timerId: null };
    const audioPlayer = document.getElementById('audio-player');
    let newWallpaperBase64 = null;
    let isSelectionMode = false;
    let selectedMessages = new Set();
    let editingMemberId = null;
    let editingFrameForMember = false;
    let editingWorldBookId = null;
    let editingPersonaPresetId = null;

    let waimaiTimers = {}; // 用于存储外卖倒计时

    let activeMessageTimestamp = null;
    let activePostId = null; // <-- 新增：用于存储当前操作的动态ID

    let photoViewerState = {
        isOpen: false,
        photos: [], // 存储当前相册的所有照片URL
        currentIndex: -1, // 当前正在查看的照片索引
    };

    let unreadPostsCount = 0;

    let isFavoritesSelectionMode = false;
    let selectedFavorites = new Set()

    let simulationIntervalId = null;

    const frameModal = document.getElementById('avatar-frame-modal');
    const aiFrameTab = document.getElementById('ai-frame-tab');
    const myFrameTab = document.getElementById('my-frame-tab');
    const aiFrameContent = document.getElementById('ai-frame-content');
    const myFrameContent = document.getElementById('my-frame-content');
    const aiFrameGrid = document.getElementById('ai-frame-grid');
    const myFrameGrid = document.getElementById('my-frame-grid');

    const defaultAvatar = 'https://i.postimg.cc/PxZrFFFL/o-o-1.jpg';
    const defaultMyGroupAvatar = 'https://i.postimg.cc/cLPP10Vm/4.jpg';
    const defaultGroupMemberAvatar = 'https://i.postimg.cc/VkQfgzGJ/1.jpg';
    const defaultGroupAvatar = 'https://i.postimg.cc/gc3QYCDy/1-NINE7-Five.jpg';
    let notificationTimeout;

    // ▼▼▼ 在JS顶部，变量定义区，添加这个新常量 ▼▼▼
    const DEFAULT_APP_ICONS = {
        'world-book': 'https://i.postimg.cc/mZ0vV6tT/IMG-6907.jpg',
        'qq': 'https://i.postimg.cc/gJ7Dz5fj/IMG-6906.jpg',
        'api-settings': 'https://i.postimg.cc/RhnTNdBR/IMG-6908.jpg',
        'wallpaper': 'https://i.postimg.cc/WbgQy6kg/IMG-6909.jpg',
        'font': 'https://files.catbox.moe/j1kn1a.jpeg'
    };
    // ▲▲▲ 添加结束 ▲▲▲

    const avatarFrames = [{ id: 'none', url: '', name: '无' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/fLDnz5Pn/IMG-5574.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/HxH3cNHz/IMG-6871.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/jCVK0fGL/IMG-6890.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/85Zsyjwn/IMG-6895.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/cJtpZCB3/IMG-6894.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/63sDQKMm/IMG-6893.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/cHQPgzj4/IMG-6888.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/dVLXm3Xf/IMG-6885.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/kGsZwbq0/IMG-6886.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/63NmX03s/IMG-4366.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/zvz2LGK0/IMG-4367.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/prsGKMBx/IMG-4370.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/gk0BmrY0/IMG-4371.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/fRt2SFSn/IMG-4368.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/kGgwJhPH/IMG-4374.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/PrcKH436/IMG-4376.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/fRV86FMq/IMG-4381.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/HsyqMVyk/IMG-4385.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/qBbKK7dS/IMG-4386.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/05wnd389/IMG-4388.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/RZNLhbbr/IMG-4389.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/fLTc42dg/IMG-4391.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/FzbGNdRT/IMG-4392.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/XY63sTS3/IMG-4393.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/Cx9vCVWH/IMG-4395.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/kMfPQBwQ/IMG-4396.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/CLrZQMMD/IMG-4398.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/L4zwDhTC/IMG-4399.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/yN3s8szM/IMG-4400.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/59Cn1tkB/IMG-4401.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/g0s1V0PX/IMG-4402.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/Jn1DFPgY/IMG-4403.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/q7cQnDy1/IMG-4404.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/RFK3q2t0/IMG-4407.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/gcV0VR2t/IMG-4408.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/W1CjLb4J/IMG-4409.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/Ss7pM6fW/IMG-4410.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/nrFfYX3N/IMG-4412.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/cHWp0KG6/IMG-4413.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/4yNjHrdg/IMG-4414.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/hPX5F8Qp/IMG-4415.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/vHCSG1WM/IMG-4416.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/x1Hp80Rm/IMG-4417.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/FHRcCGfH/IMG-4418.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/13hhJ77p/IMG-4419.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/J4WCQd2j/IMG-4420.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/Dydkpd9H/IMG-4421.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/mrkvDxPW/IMG-4422.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/76Tj3g1B/IMG-4425.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/3N5Vndn3/IMG-4426.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/05DLr0yj/IMG-4427.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/GhR6DT4Q/IMG-4428.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/fRTF24jS/IMG-4430.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/R0WYmcYM/IMG-4431.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/nrJSqNhz/IMG-4432.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/tC9mJ0cv/IMG-4438.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/XNkQTHvf/IMG-5561.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/Mpv5fzm5/IMG-4439.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/T1tjhsyB/IMG-4720.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/c4JMPd2W/IMG-4724.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/g2XykNGB/IMG-4727.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/y8MmJcd6/IMG-4728.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/Lsjzj5Yt/IMG-4729.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/bNdk33SN/IMG-4893.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/4x9tTy1D/IMG-5563.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/DZshzKv6/IMG-5576.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/Fsvr71JL/IMG-5573.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/Fz3HwLk9/IMG-5569.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/wjH180kn/IMG-5566.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/MG6qtLYK/IMG-5565.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/CKgDNYVb/IMG-5577.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/hj4dkrvj/IMG-5578.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/hj4dkrvj/IMG-5578.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/C5XnfpNB/IMG-5579.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/4y7mGFgJ/IMG-5716.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/FzM1Hgr0/IMG-5717.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/rF4KYbjj/IMG-5720.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/6pLTBvDG/IMG-5721.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/VNK6Ccsf/IMG-5722.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/wx72fhr2/IMG-5968.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/QdrqdvdY/IMG-5969.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/0yd0MZ6k/IMG-5971.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/1zmcp66p/IMG-5973.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/wBw5Fvcn/IMG-5974.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/R0pfKYvB/IMG-5976.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/9fQZ425b/IMG-5975.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/v8V9xXjJ/IMG-6137.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/WbmkXzsS/IMG-6138.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/Dw2bDhZh/IMG-6140.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/ZqQBCyLY/IMG-6144.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/qRCtnMms/IMG-6145.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/1Rwn3XVP/IMG-6146.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/Kv51tW5H/IMG-6147.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/nhcC21Rc/IMG-6148.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/fTWzQRx8/IMG-6149.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/LXyyqDbY/IMG-6294.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/7Zgm1wRy/IMG-6295.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/5tbpnDcQ/IMG-6296.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/YSRRV8kn/IMG-6297.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/k45sd8gn/IMG-6375.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/50k390X8/IMG-6376.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/90RBDh9K/IMG-6377.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/cCpBYbMH/IMG-6552.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/Pf9g2fSL/IMG-6554.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/gkhf597g/IMG-6555.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/g2PfbSFm/IMG-6556.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/pLY3WfR8/IMG-6557.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/65Cmcr7S/IMG-6559.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/Y94XWYKd/IMG-6560.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/ydwLXx7s/IMG-6562.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/G3y73Fj2/IMG-6563.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/TYvkKKkc/IMG-6565.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/GmcqjZn8/IMG-6566.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/k5Gs0K47/IMG-6567.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/XJy8JWdh/IMG-6568.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/fycfcvHf/IMG-6569.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/J7ZxC11H/IMG-6570.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/hPnrSHjy/IMG-4434.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/YqxxjbLp/IMG-6572.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/wjfcQMkZ/IMG-6573.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/Vv8jkCYr/IMG-6574.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/MZ77rdDy/IMG-6850.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/T3NvqJCZ/IMG-6851.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/28TsrxRV/IMG-6852.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/VkV2bLNw/IMG-6853.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/gJ95NSRB/IMG-6854.gif', name: '14' }, { id: 'frame_cat_ear', url: 'https://i.postimg.cc/d1qsQsbQ/IMG-6855.gif', name: '1' }, { id: 'frame_ribbon', url: 'https://i.postimg.cc/gJNYx9pV/IMG-6856.gif', name: '2' }, { id: 'frame_flower', url: 'https://i.postimg.cc/fyPDvxJk/IMG-6860.gif', name: '3' }, { id: 'frame_tech', url: 'https://i.postimg.cc/QMDsSNxg/IMG-6861.gif', name: '4' }, { id: 'frame_5', url: 'https://i.postimg.cc/vBqsQW7X/IMG-6858.gif', name: '5' }, { id: 'frame_6', url: 'https://i.postimg.cc/Y0vwjhb7/IMG-6857.gif', name: '6' }, { id: 'frame_7', url: 'https://i.postimg.cc/90sH9Cn7/IMG-6868.gif', name: '7' }, { id: 'frame_8', url: 'https://i.postimg.cc/Y2PHZzCC/IMG-6866.gif', name: '8' }, { id: 'frame_9', url: 'https://i.postimg.cc/7Z8yYP7v/IMG-6889.gif', name: '9' }, { id: 'frame_10', url: 'https://i.postimg.cc/nryNzTXK/IMG-6915.gif', name: '10' }, { id: 'frame_11', url: 'https://i.postimg.cc/Qx5dqyJ3/IMG-6917.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/Wbr0JSDD/IMG-5316.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/tgR6wjBP/IMG-5570.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/d0WCKxff/IMG-6932.gif', name: '14' }, { id: 'frame_11', url: 'https://i.postimg.cc/Ss3znzk7/IMG-6934.gif', name: '11' }, { id: 'frame_12', url: 'https://i.postimg.cc/nrm9BcL8/IMG-6941.gif', name: '12' }, { id: 'frame_13', url: 'https://i.postimg.cc/ZYvd1jxf/IMG-6937.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/sDFhySn3/IMG-6936.gif', name: '14' }, { id: 'frame_13', url: 'https://i.postimg.cc/43PhvxRq/IMG-6922.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/3Rb46fRZ/IMG-6923.gif', name: '14' }, { id: 'frame_13', url: 'https://i.postimg.cc/PJppkbvn/IMG-6918.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/XqRZNZ9G/IMG-6916.gif', name: '14' }, { id: 'frame_14', url: 'https://i.postimg.cc/RVt6sRzc/IMG-6939.gif', name: '14' }, { id: 'frame_13', url: 'https://i.postimg.cc/mgGc0HbK/IMG-6926.gif', name: '13' }, { id: 'frame_14', url: 'https://i.postimg.cc/P5zLh5JJ/IMG-6942.gif', name: '14' }, { id: 'frame_14', url: 'https://i.postimg.cc/xCqqKGRN/IMG-6929.gif', name: '14' },
    { id: 'frame_12', url: 'https://i.postimg.cc/7LSRp4hx/e7fa949b9pc84cff0dabe57defceb54c.gif', name: '12' },
    { id: 'frame_13', url: 'https://i.postimg.cc/DZgMwc1H/817178fdbpf2ff7740dc98e26ab78759.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/3NffgJSZ/e09c07034ld7e62266c0a5de6a36ae62.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/vHDNGfT2/35ac7f372v588bf48d4f659077196b85.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/KvVsjjgG/3c3aa5219s18b90187ef1f54b3db7ba8.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/k5P1NHcL/55f3e31d8qbc8a02d152b07b99d31567.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/FFCTCzpy/641bad3b3udc599fdb63ca75fde427e5.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/8k7YSLjK/1689aa46aqc4b9ffc0f970e668f56537.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/J0CZSwyW/IMG-6938.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/Df1qLzDf/IMG-6927.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/CLNkrQSW/IMG-6925.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/y8p9s3Jj/IMG-6919.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/Lsr1Zd3Z/IMG-6928.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/Ssgbv41n/IMG-6876.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/SNByPrf9/IMG-7005.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/Z5nrCyS5/IMG-7006.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/mDfMXXFP/IMG-7007.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/DZrGtrqB/IMG-7008.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/ZnJNZWHZ/IMG-7009.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/RhGH0vpt/IMG-7010.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/tRzPkzRg/IMG-7012.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/wTTNGs3Q/IMG-7013.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/3JSG5Jv5/IMG-7014.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/rwDr8X1d/IMG-7015.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/DzDy2vS7/IMG-7017.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/QMVdG9x6/IMG-7016.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/mZ9hgH3J/IMG-7019.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/t4ksHGdg/IMG-7020.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/hP9JpdfT/IMG-7023.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/wTKyXVT9/IMG-7024.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/ZqjKXPSv/IMG-7025.gif', name: '14' },

    { id: 'frame_14', url: 'https://i.postimg.cc/gj3Tmqz5/mmexport1751030241029.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/4yCXW52F/mmexport1751030908335.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/VkXngG72/mmexport1751031208329.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/LscBkxZb/mmexport1751017556565.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/1XqzGKwJ/mmexport1751018282681.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/8kHCQwbQ/mmexport1751020645824.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/HWynLK7f/mmexport1751021724230.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/JnwFp3Kx/mmexport1751031208329.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/HLZNWkQw/mmexport1751031767634.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/vH2X6N1y/mmexport1751032231179.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/NFS4ZyvM/mmexport1751032686953.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/3RpmWc8c/mmexport1751033102811.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/L5RLr3tg/mmexport1751035976943.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/4NCPsp5d/mmexport1751034427637.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/CMv02LHm/mmexport1751034842120.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/rFnSzWGx/mmexport1751035618517.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/7YRbzN51/mmexport1751036276038.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/cJpbtPWq/mmexport1751036607799.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/HxLV5v92/mmexport1751036977582.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/D01rYy86/mmexport1751037965259.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/J4fwkTLW/mmexport1751038167142.gif', name: '14' },


    { id: 'frame_14', url: 'https://i.postimg.cc/xjpN4swz/IMG-7240.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/ZnzbGdxX/IMG-7239.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/DyYDmKtw/IMG-7238.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/W40f9qtd/IMG-7098.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/8PsK20jQ/IMG-7236.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/cHsTXDVz/IMG-7235.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/sXwm8Yzg/IMG-7234.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/xTk5xN49/IMG-7233.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/k5yv6QBv/IMG-7232.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/yx2m4nbs/IMG-7231.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/vZt0fFKn/IMB-r-HMBXY.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/pddJj9zN/IMG-7094.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/rmB17Qbc/IMB-f-VDf-Fc.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/VkKjzYTK/IMB-f4kk-CT.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/B6KD52vz/IMG-7096.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/9XPwWmwy/IMB-Kf7um-P.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/mrFhKBGz/IMB-e-QWBpa.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/bw4wxW2z/IMB-16r-COL.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/3x0Kx1fz/IMB-K1u-Jp-P.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/CLz0cJ0d/IMG-7116.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/fyyGgW61/IMG-7115.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/gkk7s0vD/IMG-6984.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/0NpZPgYj/IMG-6985.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/tTWKKmTN/IMG-7073.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/jS8tc9wW/IMG-7083.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/rmRVKJpD/IMG-7087.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/zvWGPjms/IMG-7090.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/YSkqDg8V/IMG-7092.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/FzqHTBng/IMG-7093.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/tTpZ6wLs/IMG-7095.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/8P5vt8sW/IMG-7097.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/wMxmCZVC/IMG-7099.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/2jxd0FGp/IMG-7100.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/B6T59xGK/IMG-7101.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/kXfcgFRN/IMG-7106.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/htZppbS4/IMG-7107.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/hPgyjtyn/IMG-7108.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/HLKvs0Kv/IMG-7109.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/wjwbnYkp/IMG-7111.gif', name: '14' },
    { id: 'frame_13', url: 'https://i.postimg.cc/bJDMQVkj/IMG-7112.gif', name: '13' },
    { id: 'frame_14', url: 'https://i.postimg.cc/SNWBTP5S/IMG-7113.gif', name: '14' },
    { id: 'frame_14', url: 'https://i.postimg.cc/jCVMQsKH/IMG-7114.gif', name: '14' },

    ];

    let currentFrameSelection = { ai: null, my: null };
    const STICKER_REGEX = /^(https:\/\/i\.postimg\.cc\/.+|https:\/\/files\.catbox\.moe\/.+|data:image)/;
    const MESSAGE_RENDER_WINDOW = 50;
    let currentRenderedCount = 0;
    let lastKnownBatteryLevel = 1;
    let alertFlags = { hasShown40: false, hasShown20: false, hasShown10: false };
    let batteryAlertTimeout;
    const dynamicFontStyle = document.createElement('style');
    dynamicFontStyle.id = 'dynamic-font-style';
    document.head.appendChild(dynamicFontStyle);

    const modalOverlay = document.getElementById('custom-modal-overlay');
    const modalTitle = document.getElementById('custom-modal-title');
    const modalBody = document.getElementById('custom-modal-body');
    const modalConfirmBtn = document.getElementById('custom-modal-confirm');
    const modalCancelBtn = document.getElementById('custom-modal-cancel');
    let modalResolve;

    function showCustomModal() {
        modalOverlay.classList.add('visible');
    }

    function hideCustomModal() {
        modalOverlay.classList.remove('visible');
        modalConfirmBtn.classList.remove('btn-danger');
        if (modalResolve) modalResolve(null);
    }

    function showCustomConfirm(title, message, options = {}) {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p>${message}</p>`;
            modalCancelBtn.style.display = 'block';
            modalConfirmBtn.textContent = '确定';
            if (options.confirmButtonClass) modalConfirmBtn.classList.add(options.confirmButtonClass);
            modalConfirmBtn.onclick = () => { resolve(true); hideCustomModal(); };
            modalCancelBtn.onclick = () => { resolve(false); hideCustomModal(); };
            showCustomModal();
        });
    }

    function showCustomAlert(title, message) {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p style="text-align: left; white-space: pre-wrap;">${message}</p>`;
            modalCancelBtn.style.display = 'none';
            modalConfirmBtn.textContent = '好的';
            modalConfirmBtn.onclick = () => {
                modalCancelBtn.style.display = 'block';
                modalConfirmBtn.textContent = '确定';
                resolve(true);
                hideCustomModal();
            };
            showCustomModal();
        });
    }

    // ▼▼▼ 请用这个【功能增强版】替换旧的 showCustomPrompt 函数 ▼▼▼
    function showCustomPrompt(title, placeholder, initialValue = '', type = 'text', extraHtml = '') {
        return new Promise(resolve => {
            modalResolve = resolve;
            modalTitle.textContent = title;
            const inputId = 'custom-prompt-input';

            const inputHtml = type === 'textarea'
                ? `<textarea id="${inputId}" placeholder="${placeholder}" rows="4" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px; box-sizing: border-box; resize: vertical;">${initialValue}</textarea>`
                : `<input type="${type}" id="${inputId}" placeholder="${placeholder}" value="${initialValue}">`;

            // 【核心修改】将额外的HTML和输入框组合在一起
            modalBody.innerHTML = extraHtml + inputHtml;
            const input = document.getElementById(inputId);

            // 【核心修改】为格式助手按钮绑定事件
            modalBody.querySelectorAll('.format-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const templateStr = btn.dataset.template;
                    if (templateStr) {
                        try {
                            const templateObj = JSON.parse(templateStr);
                            // 使用 null, 2 参数让JSON字符串格式化，带缩进，更易读
                            input.value = JSON.stringify(templateObj, null, 2);
                            input.focus();
                        } catch (e) {
                            console.error("解析格式模板失败:", e);
                        }
                    }
                });
            });

            modalConfirmBtn.onclick = () => { resolve(input.value); hideCustomModal(); };
            modalCancelBtn.onclick = () => { resolve(null); hideCustomModal(); };
            showCustomModal();
            setTimeout(() => input.focus(), 100);
        });
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ===================================================================
    // 2. 数据库结构定义
    // ===================================================================

    db.version(20).stores({
        chats: '&id, isGroup, groupId',
        apiConfig: '&id',
        globalSettings: '&id',
        userStickers: '&id, url, name',
        worldBooks: '&id, name',
        musicLibrary: '&id',
        personaPresets: '&id',
        qzoneSettings: '&id',
        qzonePosts: '++id, timestamp',
        qzoneAlbums: '++id, name, createdAt',
        qzonePhotos: '++id, albumId',
        favorites: '++id, type, timestamp, originalTimestamp',
        qzoneGroups: '++id, name',
        memories: '++id, chatId, timestamp, type, targetDate' // <--【核心】增加 targetDate 索引
    });

    // ===================================================================
    // 3. 所有功能函数定义
    // ===================================================================

    function showScreen(screenId) {
        if (screenId === 'chat-list-screen') {
            window.renderChatListProxy();
            switchToChatListView('messages-view');
        }
        if (screenId === 'api-settings-screen') window.renderApiSettingsProxy();
        if (screenId === 'wallpaper-screen') window.renderWallpaperScreenProxy();
        if (screenId === 'world-book-screen') window.renderWorldBookScreenProxy();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) screenToShow.classList.add('active');
        if (screenId === 'chat-interface-screen') window.updateListenTogetherIconProxy(state.activeChatId);
        if (screenId === 'font-settings-screen') {
            document.getElementById('font-url-input').value = state.globalSettings.fontUrl || '';
            applyCustomFont(state.globalSettings.fontUrl || '', true);
        }
    }
    window.updateListenTogetherIconProxy = () => { };

    function switchToChatListView(viewId) {
        const chatListScreen = document.getElementById('chat-list-screen');
        const views = {
            'messages-view': document.getElementById('messages-view'),
            'qzone-screen': document.getElementById('qzone-screen'),
            'favorites-view': document.getElementById('favorites-view'),
            'memories-view': document.getElementById('memories-view') // <-- 新增这一行
        };
        const mainHeader = document.getElementById('main-chat-list-header');
        const mainBottomNav = document.getElementById('chat-list-bottom-nav'); // 获取主导航栏

        if (isFavoritesSelectionMode) {
            document.getElementById('favorites-edit-btn').click();
        }

        // 隐藏所有视图
        Object.values(views).forEach(v => v.classList.remove('active'));
        // 显示目标视图
        if (views[viewId]) {
            views[viewId].classList.add('active');
        }

        // 更新底部导航栏高亮
        document.querySelectorAll('#chat-list-bottom-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        // ▼▼▼ 【核心修正】在这里统一管理所有UI元素的显隐 ▼▼▼
        if (viewId === 'messages-view') {
            mainHeader.style.display = 'flex';
            mainBottomNav.style.display = 'flex';
        } else {
            mainHeader.style.display = 'none';
            mainBottomNav.style.display = 'none';
        }
        // ▲▲▲ 修正结束 ▲▲▲

        if (viewId !== 'memories-view') {
            activeCountdownTimers.forEach(timerId => clearInterval(timerId));
            activeCountdownTimers = [];
        }

        // 根据视图ID执行特定的渲染/更新逻辑
        switch (viewId) {
            case 'qzone-screen':
                views['qzone-screen'].style.backgroundColor = '#f0f2f5';
                updateUnreadIndicator(0);
                renderQzoneScreen();
                renderQzonePosts();
                break;
            case 'favorites-view':
                views['favorites-view'].style.backgroundColor = '#f9f9f9';
                renderFavoritesScreen();
                break;
            case 'messages-view':
                // 如果需要，可以在这里添加返回消息列表时要执行的逻辑
                break;
        }
    }

    function renderQzoneScreen() {
        if (state && state.qzoneSettings) {
            const settings = state.qzoneSettings;
            document.getElementById('qzone-nickname').textContent = settings.nickname;
            document.getElementById('qzone-avatar-img').src = settings.avatar;
            document.getElementById('qzone-banner-img').src = settings.banner;
        }
    }
    window.renderQzoneScreenProxy = renderQzoneScreen;

    async function saveQzoneSettings() {
        if (db && state.qzoneSettings) {
            await db.qzoneSettings.put(state.qzoneSettings);
        }
    }

    function formatPostTimestamp(timestamp) {
        if (!timestamp) return '';
        const now = new Date();
        const date = new Date(timestamp);
        const diffSeconds = Math.floor((now - date) / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffMinutes < 1) return '刚刚';
        if (diffMinutes < 60) return `${diffMinutes}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        if (now.getFullYear() === year) {
            return `${month}-${day} ${hours}:${minutes}`;
        } else {
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    }

    async function renderQzonePosts() {
        const postsListEl = document.getElementById('qzone-posts-list');
        if (!postsListEl) return;

        const [posts, favorites] = await Promise.all([
            db.qzonePosts.orderBy('timestamp').reverse().toArray(),
            db.favorites.where('type').equals('qzone_post').toArray() // 获取所有已收藏的动态
        ]);

        // 创建一个已收藏帖子ID的集合，方便快速查找
        const favoritedPostIds = new Set(favorites.map(fav => fav.content.id));

        postsListEl.innerHTML = '';

        if (posts.length === 0) {
            postsListEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 30px 0;">这里空空如也，快来发布第一条说说吧！</p>';
            return;
        }

        const userSettings = state.qzoneSettings;

        posts.forEach(post => {
            const postContainer = document.createElement('div');
            postContainer.className = 'qzone-post-container';
            postContainer.dataset.postId = post.id;

            const postEl = document.createElement('div');
            postEl.className = 'qzone-post-item';

            let authorAvatar = '', authorNickname = '', commentAvatar = userSettings.avatar;

            if (post.authorId === 'user') {
                authorAvatar = userSettings.avatar;
                authorNickname = userSettings.nickname;
            } else if (state.chats[post.authorId]) {
                const authorChat = state.chats[post.authorId];
                authorAvatar = authorChat.settings.aiAvatar || defaultAvatar;
                authorNickname = authorChat.name;
            } else {
                authorAvatar = defaultAvatar;
                authorNickname = '{{char}}';
            }

            let contentHtml = '';
            const publicTextHtml = post.publicText ? `<div class="post-content">${post.publicText.replace(/\n/g, '<br>')}</div>` : '';

            if (post.type === 'shuoshuo') {
                contentHtml = `<div class="post-content" style="margin-bottom: 10px;">${post.content.replace(/\n/g, '<br>')}</div>`;
            }
            else if (post.type === 'image_post' && post.imageUrl) {
                contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="${post.imageUrl}" class="chat-image"></div>` : `<img src="${post.imageUrl}" class="chat-image">`;
            }
            else if (post.type === 'text_image') {
                contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}"></div>` : `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}">`;
            }

            let likesHtml = '';
            if (post.likes && post.likes.length > 0) {
                likesHtml = `<div class="post-likes-section"><svg class="like-icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>${post.likes.join('、')} 觉得很赞</span></div>`;
            }

            let commentsHtml = '';
            if (post.comments && post.comments.length > 0) {
                commentsHtml = '<div class="post-comments-container">';
                post.comments.forEach(comment => {
                    commentsHtml += `<div class="comment-item"><span class="commenter-name">${comment.commenterName}:</span><span class="comment-text">${comment.text}</span></div>`;
                });
                commentsHtml += '</div>';
            }

            // 检查点赞和收藏状态
            const userNickname = state.qzoneSettings.nickname;
            const isLikedByUser = post.likes && post.likes.includes(userNickname);
            const isFavoritedByUser = favoritedPostIds.has(post.id); // 使用Set快速查找

            postEl.innerHTML = `
                    <div class="post-header"><img src="${authorAvatar}" class="post-avatar"><div class="post-info"><span class="post-nickname">${authorNickname}</span><span class="post-timestamp">${formatPostTimestamp(post.timestamp)}</span></div>

        <!-- 【新增】动态操作按钮 -->
        <div class="post-actions-btn">…</div>
    </div>

                    <div class="post-main-content">${contentHtml}</div>
                    <div class="post-feedback-icons">
                        <span class="action-icon like ${isLikedByUser ? 'active' : ''}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span>
                        <span class="action-icon favorite ${isFavoritedByUser ? 'active' : ''}"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg></span>
                    </div>
                    ${likesHtml}
                    ${commentsHtml}
                    <div class="post-footer"><div class="comment-section"><img src="${commentAvatar}" class="comment-avatar"><input type="text" class="comment-input" placeholder="友善的评论是交流的起点"><div class="at-mention-popup"></div></div><button class="comment-send-btn">发送</button></div>
                `;

            const deleteAction = document.createElement('div');
            deleteAction.className = 'qzone-post-delete-action';
            deleteAction.innerHTML = '<span>删除</span>';
            postContainer.appendChild(postEl);
            postContainer.appendChild(deleteAction);
            const commentSection = postContainer.querySelector('.comment-section');
            if (commentSection) {
                commentSection.addEventListener('touchstart', (e) => e.stopPropagation());
                commentSection.addEventListener('mousedown', (e) => e.stopPropagation());
            }
            postsListEl.appendChild(postContainer);
            const commentInput = postContainer.querySelector('.comment-input');
            const popup = postContainer.querySelector('.at-mention-popup');
            commentInput.addEventListener('input', () => {
                const value = commentInput.value;
                const atMatch = value.match(/@([\p{L}\w]*)$/u);
                if (atMatch) {
                    const namesToMention = new Set();
                    const authorNickname = postContainer.querySelector('.post-nickname')?.textContent;
                    if (authorNickname) namesToMention.add(authorNickname);
                    postContainer.querySelectorAll('.commenter-name').forEach(nameEl => {
                        namesToMention.add(nameEl.textContent.replace(':', ''));
                    });
                    namesToMention.delete(state.qzoneSettings.nickname);
                    popup.innerHTML = '';
                    if (namesToMention.size > 0) {
                        const searchTerm = atMatch[1];
                        namesToMention.forEach(name => {
                            if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                                const item = document.createElement('div');
                                item.className = 'at-mention-item';
                                item.textContent = name;
                                item.addEventListener('mousedown', (e) => {
                                    e.preventDefault();
                                    const newText = value.substring(0, atMatch.index) + `@${name} `;
                                    commentInput.value = newText;
                                    popup.style.display = 'none';
                                    commentInput.focus();
                                });
                                popup.appendChild(item);
                            }
                        });
                        popup.style.display = popup.children.length > 0 ? 'block' : 'none';
                    } else {
                        popup.style.display = 'none';
                    }
                } else {
                    popup.style.display = 'none';
                }
            });
            commentInput.addEventListener('blur', () => { setTimeout(() => { popup.style.display = 'none'; }, 200); });
        });
    }

    // ▼▼▼ 请用下面这个【更新后的】函数，完整替换掉你代码中旧的 displayFilteredFavorites 函数 ▼▼▼

    function displayFilteredFavorites(items) {
        const listEl = document.getElementById('favorites-list');
        listEl.innerHTML = '';

        if (items.length === 0) {
            const searchTerm = document.getElementById('favorites-search-input').value;
            const message = searchTerm ? '未找到相关收藏' : '你的收藏夹是空的，<br>快去动态或聊天中收藏喜欢的内容吧！';
            listEl.innerHTML = `<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">${message}</p>`;
            return;
        }

        for (const item of items) {
            const card = document.createElement('div');
            card.className = 'favorite-item-card';
            card.dataset.favid = item.id;

            let headerHtml = '', contentHtml = '', sourceText = '', footerHtml = '';

            if (item.type === 'qzone_post') {
                const post = item.content;
                sourceText = '来自动态';
                let authorAvatar = defaultAvatar, authorNickname = '未知用户';

                if (post.authorId === 'user') {
                    authorAvatar = state.qzoneSettings.avatar;
                    authorNickname = state.qzoneSettings.nickname;
                } else if (state.chats[post.authorId]) {
                    authorAvatar = state.chats[post.authorId].settings.aiAvatar;
                    authorNickname = state.chats[post.authorId].name;
                }

                headerHtml = `<img src="${authorAvatar}" class="avatar"><div class="info"><div class="name">${authorNickname}</div></div>`;

                const publicTextHtml = post.publicText ? `<div class="post-content">${post.publicText.replace(/\n/g, '<br>')}</div>` : '';
                if (post.type === 'shuoshuo') {
                    contentHtml = `<div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>`;
                } else if (post.type === 'image_post' && post.imageUrl) {
                    contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="${post.imageUrl}" class="chat-image"></div>` : `<img src="${post.imageUrl}" class="chat-image">`;
                } else if (post.type === 'text_image') {
                    contentHtml = publicTextHtml ? `${publicTextHtml}<div style="margin-top:10px;"><img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}"></div>` : `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="chat-image" style="cursor: pointer;" data-hidden-text="${post.hiddenContent}">`;
                }

                // ▼▼▼ 新增/修改的代码开始 ▼▼▼

                // 1. 构造点赞区域的HTML
                let likesHtml = '';
                // 检查 post 对象中是否存在 likes 数组并且不为空
                if (post.likes && post.likes.length > 0) {
                    // 如果存在，就创建点赞区域的 div
                    likesHtml = `
                    <div class="post-likes-section">
                        <svg class="like-icon" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span>${post.likes.join('、')} 觉得很赞</span>
                    </div>`;
                }

                // 2. 构造评论区域的HTML
                let commentsHtml = '';
                // 检查 post 对象中是否存在 comments 数组并且不为空
                if (post.comments && post.comments.length > 0) {
                    // 如果存在，就创建评论容器，并遍历每一条评论
                    commentsHtml = '<div class="post-comments-container">';
                    post.comments.forEach(comment => {
                        commentsHtml += `
                        <div class="comment-item">
                            <span class="commenter-name">${comment.commenterName}:</span>
                            <span class="comment-text">${comment.text}</span>
                        </div>`;
                    });
                    commentsHtml += '</div>';
                }

                // 3. 将点赞和评论的HTML组合到 footerHtml 中
                footerHtml = `${likesHtml}${commentsHtml}`;

                // ▲▲▲ 新增/修改的代码结束 ▲▲▲

            } else if (item.type === 'chat_message') {
                const msg = item.content;
                const chat = state.chats[item.chatId];
                if (!chat) continue;

                sourceText = `来自与 ${chat.name} 的聊天`;
                const isUser = msg.role === 'user';
                let senderName, senderAvatar;

                if (isUser) {
                    senderName = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
                    senderAvatar = chat.settings.myAvatar || (chat.isGroup ? defaultMyGroupAvatar : defaultAvatar);
                } else {
                    if (chat.isGroup) {
                        const member = chat.members.find(m => m.name === msg.senderName);
                        senderName = msg.senderName;
                        senderAvatar = member ? member.avatar : defaultGroupMemberAvatar;
                    } else {
                        senderName = chat.name;
                        senderAvatar = chat.settings.aiAvatar || defaultAvatar;
                    }
                }

                headerHtml = `<img src="${senderAvatar}" class="avatar"><div class="info"><div class="name">${senderName}</div></div>`;

                if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
                    contentHtml = `<img src="${msg.content}" class="sticker-image" style="max-width: 80px; max-height: 80px;">`;
                } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
                    contentHtml = `<img src="${msg.content[0].image_url.url}" class="chat-image">`;
                } else {
                    contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
                }
            }

            // ▼▼▼ 修改最终的HTML拼接，加入 footerHtml ▼▼▼
            card.innerHTML = `
            <div class="fav-card-header">${headerHtml}<div class="source">${sourceText}</div></div>
            <div class="fav-card-content">${contentHtml}</div>
            ${footerHtml}`; // <-- 把我们新创建的 footerHtml 放在这里

            listEl.appendChild(card);
        }
    }

    // ▲▲▲ 替换区域结束 ▲▲▲

    /**
     * 【重构后的函数】: 负责准备数据并触发渲染
     */
    async function renderFavoritesScreen() {
        // 1. 从数据库获取最新数据并缓存
        allFavoriteItems = await db.favorites.orderBy('timestamp').reverse().toArray();

        // 2. 清空搜索框并隐藏清除按钮
        const searchInput = document.getElementById('favorites-search-input');
        const clearBtn = document.getElementById('favorites-search-clear-btn');
        searchInput.value = '';
        clearBtn.style.display = 'none';

        // 3. 显示所有收藏项
        displayFilteredFavorites(allFavoriteItems);
    }

    // ▲▲▲ 粘贴结束 ▲▲▲

    function resetCreatePostModal() {
        document.getElementById('post-public-text').value = '';
        document.getElementById('post-image-preview').src = '';
        document.getElementById('post-image-description').value = '';
        document.getElementById('post-image-preview-container').classList.remove('visible');
        document.getElementById('post-image-desc-group').style.display = 'none';
        document.getElementById('post-local-image-input').value = '';
        document.getElementById('post-hidden-text').value = '';
        document.getElementById('switch-to-image-mode').click();
    }

    // ▼▼▼ 用这个【已包含 memories】的版本，完整替换旧的 exportBackup 函数 ▼▼▼
    async function exportBackup() {
        try {
            const backupData = {
                version: 1,
                timestamp: Date.now()
            };

            const [
                chats, worldBooks, userStickers, apiConfig, globalSettings,
                personaPresets, musicLibrary, qzoneSettings, qzonePosts,
                qzoneAlbums, qzonePhotos, favorites, qzoneGroups,
                memories // 【核心修正】新增
            ] = await Promise.all([
                db.chats.toArray(),
                db.worldBooks.toArray(),
                db.userStickers.toArray(),
                db.apiConfig.get('main'),
                db.globalSettings.get('main'),
                db.personaPresets.toArray(),
                db.musicLibrary.get('main'),
                db.qzoneSettings.get('main'),
                db.qzonePosts.toArray(),
                db.qzoneAlbums.toArray(),
                db.qzonePhotos.toArray(),
                db.favorites.toArray(),
                db.qzoneGroups.toArray(),
                db.memories.toArray() // 【核心修正】新增
            ]);

            Object.assign(backupData, {
                chats, worldBooks, userStickers, apiConfig, globalSettings,
                personaPresets, musicLibrary, qzoneSettings, qzonePosts,
                qzoneAlbums, qzonePhotos, favorites, qzoneGroups,
                memories // 【核心修正】新增
            });

            const blob = new Blob(
                [JSON.stringify(backupData, null, 2)],
                { type: 'application/json' }
            );
            const url = URL.createObjectURL(blob);
            const link = Object.assign(document.createElement('a'), {
                href: url,
                download: `EPhone-Full-Backup-${new Date().toISOString().split('T')[0]}.json`
            });
            link.click();
            URL.revokeObjectURL(url);

            await showCustomAlert('导出成功', '已成功导出所有数据！');

        } catch (error) {
            console.error("导出数据时出错:", error);
            await showCustomAlert('导出失败', `发生了一个错误: ${error.message}`);
        }
    }

    // ▼▼▼ 用这个【已包含 memories】的版本，完整替换旧的 importBackup 函数 ▼▼▼
    async function importBackup(file) {
        if (!file) return;

        const confirmed = await showCustomConfirm(
            '严重警告！',
            '导入备份将完全覆盖您当前的所有数据，包括聊天、动态、设置等。此操作不可撤销！您确定要继续吗？',
            { confirmButtonClass: 'btn-danger' }
        );

        if (!confirmed) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            await db.transaction('rw', db.tables, async () => {
                for (const table of db.tables) {
                    await table.clear();
                }

                if (Array.isArray(data.chats)) await db.chats.bulkPut(data.chats);
                if (Array.isArray(data.worldBooks)) await db.worldBooks.bulkPut(data.worldBooks);
                if (Array.isArray(data.userStickers)) await db.userStickers.bulkPut(data.userStickers);
                if (Array.isArray(data.personaPresets)) await db.personaPresets.bulkPut(data.personaPresets);
                if (Array.isArray(data.qzonePosts)) await db.qzonePosts.bulkPut(data.qzonePosts);
                if (Array.isArray(data.qzoneAlbums)) await db.qzoneAlbums.bulkPut(data.qzoneAlbums);
                if (Array.isArray(data.qzonePhotos)) await db.qzonePhotos.bulkPut(data.qzonePhotos);
                if (Array.isArray(data.favorites)) await db.favorites.bulkPut(data.favorites);
                if (Array.isArray(data.qzoneGroups)) await db.qzoneGroups.bulkPut(data.qzoneGroups);
                if (Array.isArray(data.memories)) await db.memories.bulkPut(data.memories); // 【核心修正】新增

                if (data.apiConfig) await db.apiConfig.put(data.apiConfig);
                if (data.globalSettings) await db.globalSettings.put(data.globalSettings);
                if (data.musicLibrary) await db.musicLibrary.put(data.musicLibrary);
                if (data.qzoneSettings) await db.qzoneSettings.put(data.qzoneSettings);
            });

            await showCustomAlert('导入成功', '所有数据已成功恢复！应用即将刷新以应用所有更改。');

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error("导入数据时出错:", error);
            await showCustomAlert('导入失败', `文件格式不正确或数据已损坏: ${error.message}`);
        }
    }

    function applyCustomFont(fontUrl, isPreviewOnly = false) {
        if (!fontUrl) {
            dynamicFontStyle.innerHTML = '';
            document.getElementById('font-preview').style.fontFamily = '';
            return;
        }
        const fontName = 'custom-user-font';
        const newStyle = `
                @font-face {
                  font-family: '${fontName}';
                  src: url('${fontUrl}');
                  font-display: swap;
                }`;
        if (isPreviewOnly) {
            const previewStyle = document.getElementById('preview-font-style') || document.createElement('style');
            previewStyle.id = 'preview-font-style';
            previewStyle.innerHTML = newStyle;
            if (!document.getElementById('preview-font-style')) document.head.appendChild(previewStyle);
            document.getElementById('font-preview').style.fontFamily = `'${fontName}', 'bulangni', sans-serif`;
        } else {
            dynamicFontStyle.innerHTML = `
                    ${newStyle}
                    body {
                      font-family: '${fontName}', 'bulangni', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }`;
        }
    }

    async function resetToDefaultFont() {
        dynamicFontStyle.innerHTML = '';
        state.globalSettings.fontUrl = '';
        await db.globalSettings.put(state.globalSettings);
        document.getElementById('font-url-input').value = '';
        document.getElementById('font-preview').style.fontFamily = '';
        alert('已恢复默认字体。');
    }

    async function loadAllDataFromDB() {
        // ▼▼▼ 【核心修改在这里】 ▼▼▼
        const [
            chatsArr,
            apiConfig,
            globalSettings,
            userStickers,
            worldBooks,
            musicLib,
            personaPresets,
            qzoneSettings,
            initialFavorites // 将 initialFavorites 加入到解构赋值中
        ] = await Promise.all([
            db.chats.toArray(),
            db.apiConfig.get('main'),
            db.globalSettings.get('main'),
            db.userStickers.toArray(),
            db.worldBooks.toArray(),
            db.musicLibrary.get('main'),
            db.personaPresets.toArray(),
            db.qzoneSettings.get('main'),
            db.favorites.orderBy('timestamp').reverse().toArray() // 确保这一行在 Promise.all 的数组参数内
        ]);
        // ▲▲▲ 【修改结束】 ▲▲▲

        state.chats = chatsArr.reduce((acc, chat) => {

            // --- ▼▼▼ 核心修复就在这里 ▼▼▼ ---
            // 检查1：如果是一个单聊，并且没有 status 属性
            if (!chat.isGroup && !chat.status) {
                // 就为它补上一个默认的 status 对象
                chat.status = {
                    text: '在线',
                    lastUpdate: Date.now(),
                    isBusy: false
                };
                console.log(`为旧角色 "${chat.name}" 补全了status属性。`);
            }
            // --- ▲▲▲ 修复结束 ▲▲▲

            // --- ▼▼▼ 核心修复就在这里 ▼▼▼ ---
            // 检查2：兼容最新的“关系”功能
            if (!chat.isGroup && !chat.relationship) {
                // 如果是单聊，且没有 relationship 对象，就补上一个默认的
                chat.relationship = {
                    status: 'friend',
                    blockedTimestamp: null,
                    applicationReason: ''
                };
                console.log(`为旧角色 "${chat.name}" 补全了 relationship 属性。`);
            }
            // --- ▲▲▲ 修复结束 ▲▲▲

            // ▼▼▼ 在这里添加 ▼▼▼
            if (!chat.isGroup && (!chat.settings || !chat.settings.aiAvatarLibrary)) {
                if (!chat.settings) chat.settings = {}; // 以防万一连settings都没有
                chat.settings.aiAvatarLibrary = [];
                console.log(`为旧角色 "${chat.name}" 补全了aiAvatarLibrary属性。`);
            }
            // ▲▲▲ 添加结束 ▲▲▲

            if (!chat.musicData) chat.musicData = { totalTime: 0 };
            if (chat.settings && chat.settings.linkedWorldBookId && !chat.settings.linkedWorldBookIds) {
                chat.settings.linkedWorldBookIds = [chat.settings.linkedWorldBookId];
                delete chat.settings.linkedWorldBookId;
            }
            acc[chat.id] = chat;
            return acc;
        }, {});
        state.apiConfig = apiConfig || { id: 'main', proxyUrl: '', apiKey: '', model: '' };

        state.globalSettings = globalSettings || {
            id: 'main',
            wallpaper: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
            fontUrl: '',
            enableBackgroundActivity: false,
            backgroundActivityInterval: 60,
            blockCooldownHours: 1,
            appIcons: { ...DEFAULT_APP_ICONS } // 【核心修改】确保appIcons存在并有默认值
        };
        // 【核心修改】合并已保存的图标和默认图标，防止更新后旧数据丢失新图标
        state.globalSettings.appIcons = { ...DEFAULT_APP_ICONS, ...(state.globalSettings.appIcons || {}) };

        state.userStickers = userStickers || [];
        state.worldBooks = worldBooks || [];
        musicState.playlist = musicLib?.playlist || [];
        state.personaPresets = personaPresets || [];
        state.qzoneSettings = qzoneSettings || { id: 'main', nickname: '{{user}}', avatar: 'https://files.catbox.moe/q6z5fc.jpeg', banner: 'https://files.catbox.moe/r5heyt.gif' };

        // ▼▼▼ 【确保这一行在 Promise.all 之后，并使用解构赋值得到的 initialFavorites】 ▼▼▼
        allFavoriteItems = initialFavorites || [];
        // ▲▲▲ 【修改结束】 ▲▲▲
    }

    async function saveGlobalPlaylist() { await db.musicLibrary.put({ id: 'main', playlist: musicState.playlist }); }

    function formatTimestamp(timestamp) { if (!timestamp) return ''; const date = new Date(timestamp); const hours = String(date.getHours()).padStart(2, '0'); const minutes = String(date.getMinutes()).padStart(2, '0'); return `${hours}:${minutes}`; }

    function showNotification(chatId, messageContent) { clearTimeout(notificationTimeout); const chat = state.chats[chatId]; if (!chat) return; const bar = document.getElementById('notification-bar'); document.getElementById('notification-avatar').src = chat.settings.aiAvatar || chat.settings.groupAvatar || defaultAvatar; document.getElementById('notification-content').querySelector('.name').textContent = chat.name; document.getElementById('notification-content').querySelector('.message').textContent = messageContent; const newBar = bar.cloneNode(true); bar.parentNode.replaceChild(newBar, bar); newBar.addEventListener('click', () => { openChat(chatId); newBar.classList.remove('visible'); }); newBar.classList.add('visible'); notificationTimeout = setTimeout(() => { newBar.classList.remove('visible'); }, 4000); }

    function updateClock() { const now = new Date(); const timeString = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); const dateString = now.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }); document.getElementById('main-time').textContent = timeString; document.getElementById('status-bar-time').textContent = timeString; document.getElementById('main-date').textContent = dateString; }

    // ▼▼▼ 请用这个【终极加强版】的函数，完整替换掉你代码中旧的 parseAiResponse 函数 ▼▼▼
    function parseAiResponse(content) {
        const trimmedContent = content.trim();

        // 1. 【全新】优先处理 "[...][...]" 这种粘连的JSON数组格式
        if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
            // 使用正则表达式匹配所有独立的 "[...]" 块
            const matches = trimmedContent.match(/\[(.*?)\]/g);

            // 如果匹配到多个块，说明是粘连格式
            if (matches && matches.length > 1) {
                try {
                    let combinedResults = [];
                    for (const match of matches) {
                        // 逐个解析每个 " [...] " 字符串块
                        const parsedArray = JSON.parse(match);
                        if (Array.isArray(parsedArray)) {
                            // 将解析出的数组内容合并到总结果中
                            combinedResults = combinedResults.concat(parsedArray);
                        }
                    }
                    // 如果成功合并了内容，就返回最终结果
                    if (combinedResults.length > 0) {
                        console.log("成功解析粘连格式的JSON:", combinedResults);
                        return combinedResults;
                    }
                } catch (e) {
                    // 如果解析过程中出错，就放弃这种方法，让代码继续尝试下面的旧方法
                    console.warn("尝试解析粘连JSON失败，回退到标准解析流程。", e);
                }
            }
        }

        // 2. 尝试作为标准的、单一的JSON数组解析
        if (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmedContent);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (e) {
                // 解析失败，继续尝试其他方法
            }
        }

        // 3. 尝试作为单个JSON对象解析 (处理AI只返回一个对象的情况)
        if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmedContent);
                // 成功解析为对象后，将其放入数组中，统一格式
                return [parsed];
            } catch (e) {
                // 解析失败，继续
            }
        }

        // 4. 作为最后的备用方案，尝试从文本中提取JSON数组
        try {
            const match = content.match(/\[(.*?)\]/s);
            if (match && match[0]) {
                const parsed = JSON.parse(match[0]);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            // 提取失败
        }

        // 5. 如果以上全部失败，则视为纯文本处理
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('```'));
        if (lines.length > 0) {
            // 将纯文本包装成标准消息对象
            return lines.map(line => ({ type: 'text', content: line }));
        }

        // 6. 最终的最终，返回包含原始文本的单个消息对象
        return [{ type: 'text', content: content }];
    }
    // ▲▲▲ 替换结束 ▲▲▲

    function renderApiSettings() {
        document.getElementById('proxy-url').value = state.apiConfig.proxyUrl || ''; document.getElementById('api-key').value = state.apiConfig.apiKey || '';
        // ▼▼▼ 新增这行 ▼▼▼
        document.getElementById('background-activity-switch').checked = state.globalSettings.enableBackgroundActivity || false;
        document.getElementById('background-interval-input').value = state.globalSettings.backgroundActivityInterval || 60;
        document.getElementById('block-cooldown-input').value = state.globalSettings.blockCooldownHours || 1;
    }
    window.renderApiSettingsProxy = renderApiSettings;

    // ▼▼▼ 请用这个【全新版本】的函数，完整替换掉你旧的 renderChatList ▼▼▼
    async function renderChatList() {
        const chatListEl = document.getElementById('chat-list');
        chatListEl.innerHTML = '';

        // 1. 像以前一样，获取所有聊天并按最新消息时间排序
        const allChats = Object.values(state.chats).sort((a, b) => (b.history.slice(-1)[0]?.timestamp || 0) - (a.history.slice(-1)[0]?.timestamp || 0));

        // 2. 获取所有分组
        const allGroups = await db.qzoneGroups.toArray();

        if (allChats.length === 0) {
            chatListEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">点击右上角 "+" 或群组图标添加聊天</p>';
            return;
        }

        // --- 【核心修正开始】---

        // 3. 为每个分组找到其内部最新的消息时间戳
        allGroups.forEach(group => {
            // 从已排序的 allChats 中找到本组的第一个（也就是最新的）聊天
            const latestChatInGroup = allChats.find(chat => chat.groupId === group.id);
            // 如果找到了，就用它的时间戳；如果该分组暂时没有聊天或聊天没有历史记录，就用0
            group.latestTimestamp = latestChatInGroup ? (latestChatInGroup.history.slice(-1)[0]?.timestamp || 0) : 0;
        });

        // 4. 根据这个最新的时间戳来对“分组本身”进行排序
        allGroups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);

        // --- 【核心修正结束】---

        // 5. 现在，我们按照排好序的分组来渲染
        allGroups.forEach(group => {
            // 从总列表里过滤出属于这个（已排序）分组的好友
            const groupChats = allChats.filter(chat => !chat.isGroup && chat.groupId === group.id);
            // 如果这个分组是空的（可能所有好友都被删了），就跳过
            if (groupChats.length === 0) return;

            const groupContainer = document.createElement('div');
            groupContainer.className = 'chat-group-container';
            groupContainer.innerHTML = `
            <div class="chat-group-header">
                <span class="arrow">▼</span>
                <span class="group-name">${group.name}</span>
            </div>
            <div class="chat-group-content"></div>
        `;
            const contentEl = groupContainer.querySelector('.chat-group-content');
            // 因为 allChats 本身就是有序的，所以 groupChats 自然也是有序的
            groupChats.forEach(chat => {
                const item = createChatListItem(chat);
                contentEl.appendChild(item);
            });
            chatListEl.appendChild(groupContainer);
        });

        // 6. 最后，渲染所有群聊和未分组的好友
        // 他们的顺序因为 allChats 的初始排序，天然就是正确的
        const ungroupedOrGroupChats = allChats.filter(chat => chat.isGroup || (!chat.isGroup && !chat.groupId));
        ungroupedOrGroupChats.forEach(chat => {
            const item = createChatListItem(chat);
            chatListEl.appendChild(item);
        });

        // 为所有分组标题添加折叠事件
        document.querySelectorAll('.chat-group-header').forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                header.nextElementSibling.classList.toggle('collapsed');
            });
        });
    }
    // ▲▲▲ 替换结束 ▲▲▲

    function createChatListItem(chat) {
        const lastMsgObj = chat.history.filter(msg => !msg.isHidden).slice(-1)[0] || {};
        let lastMsgDisplay;

        // --- ▼▼▼ 【核心修改】在这里加入对关系状态的判断 ▼▼▼ ---
        if (!chat.isGroup && chat.relationship?.status === 'pending_user_approval') {
            lastMsgDisplay = `<span style="color: #ff8c00;">[好友申请] ${chat.relationship.applicationReason || '请求添加你为好友'}</span>`;
        }
        // --- ▲▲▲ 修改结束 ▲▲▲ ---

        // ▼▼▼ 在这里新增 else if ▼▼▼
        else if (!chat.isGroup && chat.relationship?.status === 'blocked_by_ai') {
            lastMsgDisplay = `<span style="color: #dc3545;">[你已被对方拉黑]</span>`;
        }
        // ▲▲▲ 新增结束 ▲▲▲

        // 【核心修改】优先显示状态，而不是最后一条消息
        if (chat.isGroup) {
            // 群聊逻辑保持不变
            if (lastMsgObj.type === 'pat_message') { lastMsgDisplay = `[系统消息] ${lastMsgObj.content}`; }
            // ... (其他群聊消息类型判断) ...
            else if (lastMsgObj.type === 'transfer') { lastMsgDisplay = '[转账]'; }
            else if (lastMsgObj.type === 'ai_image' || lastMsgObj.type === 'user_photo') { lastMsgDisplay = '[照片]'; }
            else if (lastMsgObj.type === 'voice_message') { lastMsgDisplay = '[语音]'; }
            else if (typeof lastMsgObj.content === 'string' && STICKER_REGEX.test(lastMsgObj.content)) { lastMsgDisplay = lastMsgObj.meaning ? `[表情: ${lastMsgObj.meaning}]` : '[表情]'; }
            else if (Array.isArray(lastMsgObj.content)) { lastMsgDisplay = `[图片]`; }
            else { lastMsgDisplay = String(lastMsgObj.content || '...').substring(0, 20); }

            if (lastMsgObj.senderName && lastMsgObj.type !== 'pat_message') {
                lastMsgDisplay = `${lastMsgObj.senderName}: ${lastMsgDisplay}`;
            }

        } else {
            // 单聊逻辑：显示状态
            // 确保 chat.status 对象存在
            const statusText = chat.status?.text || '在线';
            lastMsgDisplay = `[${statusText}]`;
        }

        const item = document.createElement('div');
        item.className = 'chat-list-item';
        item.dataset.chatId = chat.id;
        const avatar = chat.isGroup ? chat.settings.groupAvatar : chat.settings.aiAvatar;

        // 【核心修改】调整 last-msg 的颜色，让状态更显眼
        item.innerHTML = `
        <img src="${avatar || defaultAvatar}" class="avatar">
        <div class="info">
            <div class="name-line">
                <span class="name">${chat.name}</span>
                ${chat.isGroup ? '<span class="group-tag">群聊</span>' : ''}
            </div>
            <div class="last-msg" style="color: ${chat.isGroup ? 'var(--text-secondary)' : '#b5b5b5'}; font-style: italic;">${lastMsgDisplay}</div>
        </div>
    `;

        const avatarEl = item.querySelector('.avatar');
        if (avatarEl) {
            avatarEl.style.cursor = 'pointer';
            avatarEl.addEventListener('click', (e) => {
                e.stopPropagation();
                handleUserPat(chat.id, chat.name);
            });
        }

        const infoEl = item.querySelector('.info');
        if (infoEl) {
            infoEl.addEventListener('click', () => openChat(chat.id));
        }

        addLongPressListener(item, async (e) => {
            const confirmed = await showCustomConfirm('删除对话', `确定要删除与 "${chat.name}" 的整个对话吗？此操作不可撤销。`, { confirmButtonClass: 'btn-danger' });
            if (confirmed) {
                if (musicState.isActive && musicState.activeChatId === chat.id) await endListenTogetherSession(false);
                delete state.chats[chat.id];
                if (state.activeChatId === chat.id) state.activeChatId = null;
                await db.chats.delete(chat.id);
                renderChatList();
            }
        });
        return item;
    }

    // ▼▼▼ 请用这个【带诊断功能的全新版本】替换旧的 renderChatInterface 函数 ▼▼▼
    function renderChatInterface(chatId) {
        cleanupWaimaiTimers();
        const chat = state.chats[chatId];
        if (!chat) return;
        exitSelectionMode();

        const messagesContainer = document.getElementById('chat-messages');
        const chatInputArea = document.getElementById('chat-input-area');
        const lockOverlay = document.getElementById('chat-lock-overlay');
        const lockContent = document.getElementById('chat-lock-content');

        messagesContainer.dataset.theme = chat.settings.theme || 'default';
        const fontSize = chat.settings.fontSize || 13;
        messagesContainer.style.setProperty('--chat-font-size', `${fontSize}px`);
        applyScopedCss(chat.settings.customCss || '', '#chat-messages', 'custom-bubble-style');

        document.getElementById('chat-header-title').textContent = chat.name;
        const statusContainer = document.getElementById('chat-header-status');
        const statusTextEl = statusContainer.querySelector('.status-text');

        if (chat.isGroup) {
            statusContainer.style.display = 'none';
            document.getElementById('chat-header-title-wrapper').style.justifyContent = 'center';
        } else {
            statusContainer.style.display = 'flex';
            document.getElementById('chat-header-title-wrapper').style.justifyContent = 'flex-start';
            statusTextEl.textContent = chat.status?.text || '在线';
            statusContainer.classList.toggle('busy', chat.status?.isBusy || false);
        }

        lockOverlay.style.display = 'none';
        chatInputArea.style.visibility = 'visible';
        lockContent.innerHTML = '';

        if (!chat.isGroup && chat.relationship.status !== 'friend') {
            lockOverlay.style.display = 'flex';
            chatInputArea.style.visibility = 'hidden';

            let lockHtml = '';
            switch (chat.relationship.status) {
                case 'blocked_by_user':
                    // --- 【核心修改：在这里加入诊断面板】 ---
                    const isSimulationRunning = simulationIntervalId !== null;
                    const blockedTimestamp = chat.relationship.blockedTimestamp;
                    const cooldownHours = state.globalSettings.blockCooldownHours || 1;
                    const cooldownMilliseconds = cooldownHours * 60 * 60 * 1000;
                    const timeSinceBlock = Date.now() - blockedTimestamp;
                    const isCooldownOver = timeSinceBlock > cooldownMilliseconds;
                    const timeRemainingMinutes = Math.max(0, Math.ceil((cooldownMilliseconds - timeSinceBlock) / (1000 * 60)));

                    lockHtml = `
                    <span class="lock-text">你已将“${chat.name}”拉黑。</span>
                    <button id="unblock-btn" class="lock-action-btn">解除拉黑</button>
                    <div style="margin-top: 20px; padding: 10px; border: 1px dashed #ccc; border-radius: 8px; font-size: 11px; text-align: left; color: #666; background: rgba(0,0,0,0.02);">
                        <strong style="color: #333;">【开发者诊断面板】</strong><br>
                        - 后台活动总开关: ${state.globalSettings.enableBackgroundActivity ? '<span style="color: green;">已开启</span>' : '<span style="color: red;">已关闭</span>'}<br>
                        - 系统心跳计时器: ${isSimulationRunning ? '<span style="color: green;">运行中</span>' : '<span style="color: red;">未运行</span>'}<br>
                        - 当前角色状态: <strong>${chat.relationship.status}</strong><br>
                        - 需要冷静(小时): <strong>${cooldownHours}</strong><br>
                        - 冷静期是否结束: ${isCooldownOver ? '<span style="color: green;">是</span>' : `<span style="color: orange;">否 (还剩约 ${timeRemainingMinutes} 分钟)</span>`}<br>
                        - 触发条件: ${isCooldownOver && state.globalSettings.enableBackgroundActivity ? '<span style="color: green;">已满足，等待下次系统心跳</span>' : '<span style="color: red;">未满足</span>'}
                    </div>
                    <button id="force-apply-check-btn" class="lock-action-btn secondary" style="margin-top: 10px;">强制触发一次好友申请检测</button>
                `;
                    // --- 【修改结束】 ---
                    break;
                case 'blocked_by_ai':
                    lockHtml = `
                    <span class="lock-text">你被对方拉黑了。</span>
                    <button id="apply-friend-btn" class="lock-action-btn">重新申请加为好友</button>
                `;
                    break;

                case 'pending_user_approval':
                    lockHtml = `
                    <span class="lock-text">“${chat.name}”请求添加你为好友：<br><i>“${chat.relationship.applicationReason}”</i></span>
                    <button id="accept-friend-btn" class="lock-action-btn">接受</button>
                    <button id="reject-friend-btn" class="lock-action-btn secondary">拒绝</button>
                `;
                    break;

                // 【核心修正】修复当你申请后，你看到的界面
                case 'pending_ai_approval':
                    lockHtml = `<span class="lock-text">好友申请已发送，等待对方通过...</span>`;
                    break;
            }
            lockContent.innerHTML = lockHtml;
        }
        messagesContainer.innerHTML = '';
        // ...后续代码保持不变
        const chatScreen = document.getElementById('chat-interface-screen');
        chatScreen.style.backgroundImage = chat.settings.background ? `url(${chat.settings.background})` : 'none';
        chatScreen.style.backgroundColor = chat.settings.background ? 'transparent' : '#f0f2f5';
        const history = chat.history;
        const totalMessages = history.length;
        currentRenderedCount = 0;
        const initialMessages = history.slice(-MESSAGE_RENDER_WINDOW);
        initialMessages.forEach(msg => appendMessage(msg, chat, true));
        currentRenderedCount = initialMessages.length;
        if (totalMessages > currentRenderedCount) {
            prependLoadMoreButton(messagesContainer);
        }
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.style.display = 'none';
        typingIndicator.textContent = '对方正在输入...';
        messagesContainer.appendChild(typingIndicator);
        setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 0);
    }
    // ▲▲▲ 替换结束 ▲▲▲

    function prependLoadMoreButton(container) { const button = document.createElement('button'); button.id = 'load-more-btn'; button.textContent = '加载更早的记录'; button.addEventListener('click', loadMoreMessages); container.prepend(button); }

    function loadMoreMessages() { const messagesContainer = document.getElementById('chat-messages'); const chat = state.chats[state.activeChatId]; if (!chat) return; const loadMoreBtn = document.getElementById('load-more-btn'); if (loadMoreBtn) loadMoreBtn.remove(); const totalMessages = chat.history.length; const nextSliceStart = totalMessages - currentRenderedCount - MESSAGE_RENDER_WINDOW; const nextSliceEnd = totalMessages - currentRenderedCount; const messagesToPrepend = chat.history.slice(Math.max(0, nextSliceStart), nextSliceEnd); const oldScrollHeight = messagesContainer.scrollHeight; messagesToPrepend.reverse().forEach(msg => prependMessage(msg, chat)); currentRenderedCount += messagesToPrepend.length; const newScrollHeight = messagesContainer.scrollHeight; messagesContainer.scrollTop += (newScrollHeight - oldScrollHeight); if (totalMessages > currentRenderedCount) { prependLoadMoreButton(messagesContainer); } }

    // ▼▼▼ 用这个【新版本】替换旧的 renderWallpaperScreen 函数 ▼▼▼
    function renderWallpaperScreen() {
        const preview = document.getElementById('wallpaper-preview');
        const bg = newWallpaperBase64 || state.globalSettings.wallpaper;
        if (bg && bg.startsWith('data:image')) {
            preview.style.backgroundImage = `url(${bg})`;
            preview.textContent = '';
        } else if (bg) {
            preview.style.backgroundImage = bg;
            preview.textContent = '当前为渐变色';
        }
        // 【核心修改】在这里调用图标渲染函数
        renderIconSettings();
    }
    // ▲▲▲ 替换结束 ▲▲▲
    window.renderWallpaperScreenProxy = renderWallpaperScreen;

    function applyGlobalWallpaper() { const homeScreen = document.getElementById('home-screen'); const wallpaper = state.globalSettings.wallpaper; if (wallpaper && wallpaper.startsWith('data:image')) homeScreen.style.backgroundImage = `url(${wallpaper})`; else if (wallpaper) homeScreen.style.backgroundImage = wallpaper; }

    function renderWorldBookScreen() { const listEl = document.getElementById('world-book-list'); listEl.innerHTML = ''; if (state.worldBooks.length === 0) { listEl.innerHTML = '<p style="text-align:center; color: #8a8a8a; margin-top: 50px;">点击右上角 "+" 创建你的第一本世界书</p>'; return; } state.worldBooks.forEach(book => { const item = document.createElement('div'); item.className = 'list-item'; item.dataset.bookId = book.id; item.innerHTML = `<div class="item-title">${book.name}</div><div class="item-content">${(book.content || '暂无内容...').substring(0, 50)}</div>`; item.addEventListener('click', () => openWorldBookEditor(book.id)); addLongPressListener(item, async () => { const confirmed = await showCustomConfirm('删除世界书', `确定要删除《${book.name}》吗？此操作不可撤销。`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await db.worldBooks.delete(book.id); state.worldBooks = state.worldBooks.filter(wb => wb.id !== book.id); renderWorldBookScreen(); } }); listEl.appendChild(item); }); }
    window.renderWorldBookScreenProxy = renderWorldBookScreen;

    function openWorldBookEditor(bookId) { editingWorldBookId = bookId; const book = state.worldBooks.find(wb => wb.id === bookId); if (!book) return; document.getElementById('world-book-editor-title').textContent = book.name; document.getElementById('world-book-name-input').value = book.name; document.getElementById('world-book-content-input').value = book.content; showScreen('world-book-editor-screen'); }

    function renderStickerPanel() { const grid = document.getElementById('sticker-grid'); grid.innerHTML = ''; if (state.userStickers.length === 0) { grid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); grid-column: 1 / -1;">大人请点击右上角“添加”或“上传”来添加你的第一个表情吧！</p>'; return; } state.userStickers.forEach(sticker => { const item = document.createElement('div'); item.className = 'sticker-item'; item.style.backgroundImage = `url(${sticker.url})`; item.title = sticker.name; item.addEventListener('click', () => sendSticker(sticker)); addLongPressListener(item, () => { if (isSelectionMode) return; const existingDeleteBtn = item.querySelector('.delete-btn'); if (existingDeleteBtn) return; const deleteBtn = document.createElement('div'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = async (e) => { e.stopPropagation(); const confirmed = await showCustomConfirm('删除表情', `确定要删除表情 "${sticker.name}" 吗？`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await db.userStickers.delete(sticker.id); state.userStickers = state.userStickers.filter(s => s.id !== sticker.id); renderStickerPanel(); } }; item.appendChild(deleteBtn); deleteBtn.style.display = 'block'; setTimeout(() => item.addEventListener('mouseleave', () => deleteBtn.remove(), { once: true }), 3000); }); grid.appendChild(item); }); }

    // ▼▼▼ 用这个【已更新】的版本替换旧的 createMessageElement 函数 ▼▼▼
    function createMessageElement(msg, chat) {
        if (msg.isHidden) {
            return null;
        }

        if (msg.type === 'pat_message') {
            const wrapper = document.createElement('div');
            wrapper.className = 'message-wrapper system-pat';
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble system-bubble';
            bubble.dataset.timestamp = msg.timestamp;
            bubble.textContent = msg.content;
            wrapper.appendChild(bubble);
            addLongPressListener(wrapper, () => showMessageActions(msg.timestamp));
            wrapper.addEventListener('click', () => { if (isSelectionMode) toggleMessageSelection(msg.timestamp); });
            return wrapper;
        }

        const isUser = msg.role === 'user';
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isUser ? 'user' : 'ai'}`;

        if (chat.isGroup && !isUser) {
            const senderNameDiv = document.createElement('div');
            senderNameDiv.className = 'sender-name';
            senderNameDiv.textContent = msg.senderName || '未知成员';
            wrapper.appendChild(senderNameDiv);
        }

        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isUser ? 'user' : 'ai'}`;
        bubble.dataset.timestamp = msg.timestamp;

        const timestampEl = document.createElement('span');
        timestampEl.className = 'timestamp';
        timestampEl.textContent = formatTimestamp(msg.timestamp);

        let avatarSrc, avatarFrameSrc = '';
        if (chat.isGroup) {
            if (isUser) {
                avatarSrc = chat.settings.myAvatar || defaultMyGroupAvatar;
                avatarFrameSrc = chat.settings.myAvatarFrame || '';
            } else {
                const member = chat.members.find(m => m.name === msg.senderName);
                avatarSrc = member ? member.avatar : defaultGroupMemberAvatar;
                avatarFrameSrc = member ? (member.avatarFrame || '') : '';
            }
        } else {
            if (isUser) {
                avatarSrc = chat.settings.myAvatar || defaultAvatar;
                avatarFrameSrc = chat.settings.myAvatarFrame || '';
            } else {
                avatarSrc = chat.settings.aiAvatar || defaultAvatar;
                avatarFrameSrc = chat.settings.aiAvatarFrame || '';
            }
        }
        const hasFrameClass = avatarFrameSrc ? 'has-frame' : '';
        let avatarHtml;
        if (avatarFrameSrc) {
            avatarHtml = `
            <div class="avatar-with-frame">
                <img src="${avatarSrc}" class="avatar-img">
                <img src="${avatarFrameSrc}" class="avatar-frame">
            </div>
        `;
        } else {
            avatarHtml = `<img src="${avatarSrc}" class="avatar">`;
        }
        const avatarGroupHtml = `<div class="avatar-group ${hasFrameClass}">${avatarHtml}</div>`;

        let contentHtml;

        if (msg.type === 'share_link') {
            bubble.classList.add('is-link-share');

            // 【核心修正1】将 onclick="openBrowser(...)" 移除，我们将在JS中动态绑定事件
            contentHtml = `
            <div class="link-share-card" data-timestamp="${msg.timestamp}">
                <div class="title">${msg.title || '无标题'}</div>
                <div class="description">${msg.description || '点击查看详情...'}</div>
                <div class="footer">
                    <svg class="footer-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <span>${msg.source_name || '链接分享'}</span>
                </div>
            </div>
        `;
        }

        // 后续的其他 else if 保持不变
        else if (msg.type === 'user_photo' || msg.type === 'ai_image') {
            bubble.classList.add('is-ai-image');
            const altText = msg.type === 'user_photo' ? "用户描述的照片" : "AI生成的图片";
            contentHtml = `<img src="https://i.postimg.cc/KYr2qRCK/1.jpg" class="ai-generated-image" alt="${altText}" data-description="${msg.content}">`;
        } else if (msg.type === 'voice_message') {
            bubble.classList.add('is-voice-message');
            const duration = Math.max(1, Math.round((msg.content || '').length / 5));
            const durationFormatted = `0:${String(duration).padStart(2, '0')}''`;
            const waveformHTML = '<div></div><div></div><div></div><div></div><div></div>';
            contentHtml = `<div class="voice-message-body" data-text="${msg.content}"><div class="voice-waveform">${waveformHTML}</div><span class="voice-duration">${durationFormatted}</span></div>`;
        } else if (msg.type === 'transfer') {
            bubble.classList.add('is-transfer');

            // 【核心修改】判断是“发出”还是“收到”
            let titleText, noteText;
            if (isUser) {
                titleText = `转账给 ${msg.receiverName || 'Ta'}`;
                // 如果是用户发出的，并且AI已经处理了，就显示状态
                if (msg.status === 'accepted') {
                    noteText = '对方已收款';
                } else if (msg.status === 'declined') {
                    noteText = '对方已拒收';
                } else {
                    noteText = msg.note || '等待对方处理...';
                }
            } else { // AI发出的消息
                if (msg.isRefund) { // 【新增】判断是否为退款
                    titleText = `退款来自 ${msg.senderName}`;
                    noteText = '转账已被拒收';
                } else {
                    titleText = `收到来自 ${msg.senderName} 的转账`;
                    noteText = msg.note || '点击处理';
                }
            }

            const heartIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="vertical-align: middle;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>`;

            contentHtml = `
            <div class="transfer-card">
                <div class="transfer-title">${heartIcon} ${titleText}</div>
                <div class="transfer-amount">¥ ${Number(msg.amount).toFixed(2)}</div>
                <div class="transfer-note">${noteText}</div>
            </div>
        `;
        } else if (msg.type === 'waimai_request') {
            bubble.classList.add('is-waimai-request');
            if (msg.status === 'paid' || msg.status === 'rejected') {
                bubble.classList.add(`status-${msg.status}`);
            }
            const requestTitle = `来自 ${msg.senderName} 的代付请求`;
            let actionButtonsHtml = '';
            if (msg.status === 'pending' && !isUser) {
                actionButtonsHtml = `
                <div class="waimai-user-actions">
                    <button class="waimai-decline-btn" data-choice="rejected">残忍拒绝</button>
                    <button class="waimai-pay-btn" data-choice="paid">为Ta买单</button>
                </div>`;
            }
            contentHtml = `
            <div class="waimai-card">
                <div class="waimai-header">
                    <img src="https://files.catbox.moe/mq179k.png" class="icon" alt="Meituan Icon">
                    <div class="title-group">
                        <span class="brand">美团外卖</span><span class="separator">|</span><span>外卖美食</span>
                    </div>
                </div>
                <div class="waimai-catchphrase">Hi，你和我的距离只差一顿外卖～</div>
                <div class="waimai-main">
                    <div class="request-title">${requestTitle}</div>
                    <div class="payment-box">
                        <div class="payment-label">需付款</div>
                        <div class="amount">¥${Number(msg.amount).toFixed(2)}</div>
                        <div class="countdown-label">剩余支付时间
                            <div class="countdown-timer" id="waimai-timer-${msg.timestamp}"></div>
                        </div>
                    </div>
                    <button class="waimai-details-btn">查看详情</button>
                </div>
                ${actionButtonsHtml}
            </div>`;

            setTimeout(() => {
                const timerEl = document.getElementById(`waimai-timer-${msg.timestamp}`);
                if (timerEl && msg.countdownEndTime) {
                    if (waimaiTimers[msg.timestamp]) clearInterval(waimaiTimers[msg.timestamp]);
                    if (msg.status === 'pending') {
                        waimaiTimers[msg.timestamp] = startWaimaiCountdown(timerEl, msg.countdownEndTime);
                    } else {
                        timerEl.innerHTML = `<span>已</span><span>处</span><span>理</span>`;
                    }
                }
                const detailsBtn = document.querySelector(`.message-bubble[data-timestamp="${msg.timestamp}"] .waimai-details-btn`);
                if (detailsBtn) {
                    detailsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const paidByText = msg.paidBy ? `<br><br><b>状态：</b>由 ${msg.paidBy} 为您代付成功` : '';
                        showCustomAlert('订单详情', `<b>商品：</b>${msg.productInfo}<br><b>金额：</b>¥${Number(msg.amount).toFixed(2)}${paidByText}`);
                    });
                }
                const actionButtons = document.querySelectorAll(`.message-bubble[data-timestamp="${msg.timestamp}"] .waimai-user-actions button`);
                actionButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const choice = e.target.dataset.choice;
                        handleWaimaiResponse(msg.timestamp, choice);
                    });
                });
            }, 0);

        } else if (msg.type === 'red_packet') {
            bubble.classList.add('is-red-packet');
            const myNickname = chat.settings.myNickname || '我';

            // 从最新的 msg 对象中获取状态
            const hasClaimed = msg.claimedBy && msg.claimedBy[myNickname];
            const isFinished = msg.isFullyClaimed;

            let cardClass = '';
            let claimedInfoHtml = '';
            let typeText = '拼手气红包';

            // 1. 判断红包卡片的样式 (颜色)
            if (isFinished) {
                cardClass = 'opened';
            } else if (msg.packetType === 'direct' && Object.keys(msg.claimedBy || {}).length > 0) {
                cardClass = 'opened'; // 专属红包被领了也变灰
            }

            // 2. 判断红包下方的提示文字
            if (msg.packetType === 'direct') {
                typeText = `专属红包: 给 ${msg.receiverName}`;
            }

            if (hasClaimed) {
                claimedInfoHtml = `<div class="rp-claimed-info">你领取了红包，金额 ${msg.claimedBy[myNickname].toFixed(2)} 元</div>`;
            } else if (isFinished) {
                claimedInfoHtml = `<div class="rp-claimed-info">红包已被领完</div>`;
            } else if (msg.packetType === 'direct' && Object.keys(msg.claimedBy || {}).length > 0) {
                claimedInfoHtml = `<div class="rp-claimed-info">已被 ${msg.receiverName} 领取</div>`;
            }

            // 3. 拼接最终的HTML，确保onclick调用的是我们注册到全局的函数
            contentHtml = `
        <div class="red-packet-card ${cardClass}">
            <div class="rp-header">
                <img src="https://files.catbox.moe/lo9xhc.png" class="rp-icon">
                <span class="rp-greeting">${msg.greeting || '恭喜发财，大吉大利！'}</span>
            </div>
            <div class="rp-type">${typeText}</div>
            ${claimedInfoHtml}
        </div>
    `;
            // ▲▲▲ 新增结束 ▲▲▲

        } else if (msg.type === 'poll') {
            bubble.classList.add('is-poll');

            let totalVotes = 0;
            const voteCounts = {};

            // 计算总票数和每个选项的票数
            for (const option in msg.votes) {
                const count = msg.votes[option].length;
                voteCounts[option] = count;
                totalVotes += count;
            }

            const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
            let myVote = null;
            for (const option in msg.votes) {
                if (msg.votes[option].includes(myNickname)) {
                    myVote = option;
                    break;
                }
            }

            let optionsHtml = '<div class="poll-options-list">';
            msg.options.forEach(optionText => {
                const count = voteCounts[optionText] || 0;
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isVotedByMe = myVote === optionText;

                optionsHtml += `
            <div class="poll-option-item ${isVotedByMe ? 'voted' : ''}" data-option="${optionText}">
                <div class="poll-option-bar" style="width: ${percentage}%;"></div>
                <div class="poll-option-content">
                    <span class="poll-option-text">${optionText}</span>
                    <span class="poll-option-votes">${count} 票</span>
                </div>
            </div>
        `;
            });
            optionsHtml += '</div>';

            let footerHtml = '';
            // 【核心修改】在这里统一按钮的显示逻辑
            if (msg.isClosed) {
                // 如果投票已结束，总是显示“查看结果”
                footerHtml = `<div class="poll-footer"><span class="poll-total-votes">共 ${totalVotes} 人投票</span><button class="poll-action-btn">查看结果</button></div>`;
            } else {
                // 如果投票未结束，总是显示“结束投票”
                footerHtml = `<div class="poll-footer"><span class="poll-total-votes">共 ${totalVotes} 人投票</span><button class="poll-action-btn">结束投票</button></div>`;
            }

            contentHtml = `
        <div class="poll-card ${msg.isClosed ? 'closed' : ''}" data-poll-timestamp="${msg.timestamp}">
            <div class="poll-question">${msg.question}</div>
            ${optionsHtml}
            ${footerHtml}
        </div>
    `;
            // ▲▲▲ 替换结束 ▲▲▲

        } else if (typeof msg.content === 'string' && STICKER_REGEX.test(msg.content)) {
            bubble.classList.add('is-sticker');
            contentHtml = `<img src="${msg.content}" alt="${msg.meaning || 'Sticker'}" class="sticker-image">`;
        } else if (Array.isArray(msg.content) && msg.content[0]?.type === 'image_url') {
            bubble.classList.add('has-image');
            const imageUrl = msg.content[0].image_url.url;
            contentHtml = `<img src="${imageUrl}" class="chat-image" alt="User uploaded image">`;
        } else {
            contentHtml = String(msg.content || '').replace(/\n/g, '<br>');
        }

        bubble.innerHTML = `${avatarGroupHtml}<div class="content">${contentHtml}</div>`;

        wrapper.appendChild(bubble);
        wrapper.appendChild(timestampEl);

        addLongPressListener(wrapper, () => showMessageActions(msg.timestamp));
        wrapper.addEventListener('click', () => { if (isSelectionMode) toggleMessageSelection(msg.timestamp); });

        if (!isUser) {
            const avatarContainer = wrapper.querySelector('.avatar-group');
            if (avatarContainer) {
                avatarContainer.style.cursor = 'pointer';
                avatarContainer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const characterName = chat.isGroup ? msg.senderName : chat.name;
                    handleUserPat(chat.id, characterName);
                });
            }
        }

        return wrapper;
    }
    // ▲▲▲ 替换结束 ▲▲▲

    function prependMessage(msg, chat) {
        const messagesContainer = document.getElementById('chat-messages'); const messageEl = createMessageElement(msg, chat);

        if (!messageEl) return; // <--- 新增这行，同样的处理

        const loadMoreBtn = document.getElementById('load-more-btn'); if (loadMoreBtn) { messagesContainer.insertBefore(messageEl, loadMoreBtn.nextSibling); } else { messagesContainer.prepend(messageEl); }
    }

    // ▼▼▼ 用这个【带动画的版本】替换你原来的 appendMessage 函数 ▼▼▼
    function appendMessage(msg, chat, isInitialLoad = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = createMessageElement(msg, chat);

        if (!messageEl) return; // 如果消息是隐藏的，则不处理

        // 【核心】只对新消息添加动画，不对初始加载的消息添加
        if (!isInitialLoad) {
            messageEl.classList.add('animate-in');
        }

        const typingIndicator = document.getElementById('typing-indicator');
        messagesContainer.insertBefore(messageEl, typingIndicator);

        if (!isInitialLoad) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            currentRenderedCount++;
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 用这个【修正后】的版本，替换旧的 openChat 函数 ▼▼▼
    function openChat(chatId) {
        state.activeChatId = chatId;
        const chat = state.chats[chatId];
        if (!chat) return; // 增加一个安全检查

        renderChatInterface(chatId);
        showScreen('chat-interface-screen');
        window.updateListenTogetherIconProxy(state.activeChatId);
        toggleCallButtons(chat.isGroup || false);

        if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
            console.log(`检测到好友申请待处理状态，为角色 "${chat.name}" 自动触发AI响应...`);
            triggerAiResponse();
        }

        // 【核心修正】根据是否为群聊，显示或隐藏投票按钮
        document.getElementById('send-poll-btn').style.display = chat.isGroup ? 'flex' : 'none';
    }
    // ▲▲▲ 替换结束 ▲▲▲

    async function triggerAiResponse() {
        if (!state.activeChatId) return;
        const chatId = state.activeChatId;
        const chat = state.chats[state.activeChatId];

        const chatHeaderTitle = document.getElementById('chat-header-title');

        // 【动画核心 1/2】: AI开始输入时，先淡出旧标题，再淡入新标题
        if (chatHeaderTitle && !chat.isGroup) {
            chatHeaderTitle.style.opacity = 0;
            setTimeout(() => {
                chatHeaderTitle.textContent = '对方正在输入...';
                chatHeaderTitle.classList.add('typing-status');
                chatHeaderTitle.style.opacity = 1;
            }, 200); // 这个时间(200ms)要和CSS里的transition时间(0.2s)保持一致
        }

        try {
            const { proxyUrl, apiKey, model } = state.apiConfig;
            if (!proxyUrl || !apiKey || !model) {
                alert('请先在API设置中配置反代地址、密钥并选择模型。');
                // 【V2.0 正在输入...】恢复标题
                const chatHeaderTitle = document.getElementById('chat-header-title');
                // 确保标题元素和对应的chat数据都还存在
                if (chatHeaderTitle && state.chats[chatId]) {
                    // 只有在单聊时才恢复标题，群聊标题是固定的
                    if (!state.chats[chatId].isGroup) {
                        chatHeaderTitle.textContent = state.chats[chatId].name;
                        chatHeaderTitle.classList.remove('typing-status');
                    }
                }
                return;
            }

            // --- 【核心重构 V2：带有上下文和理由的好友申请处理逻辑】---
            if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
                console.log(`为角色 "${chat.name}" 触发带理由的好友申请决策流程...`);

                // 1. 【注入上下文】抓取被拉黑前的最后5条聊天记录作为参考
                const contextSummary = chat.history
                    .filter(m => !m.isHidden)
                    .slice(-10, -5) // 获取拉黑前的最后5条消息
                    .map(msg => {
                        const sender = msg.role === 'user' ? '用户' : chat.name;
                        return `${sender}: ${String(msg.content).substring(0, 50)}...`;
                    })
                    .join('\n');

                // 2. 【全新指令】构建一个强制AI给出理由的Prompt
                const decisionPrompt = `
# 你的任务
你现在是角色“${chat.name}”。用户之前被你拉黑了，现在TA向你发送了好友申请，希望和好。

# 供你决策的上下文信息:
- **你的角色设定**: ${chat.settings.aiPersona}
- **用户发送的申请理由**: “${chat.relationship.applicationReason}”
- **被拉黑前的最后对话摘要**: 
${contextSummary || "（无有效对话记录）"}

# 你的唯一指令
根据以上所有信息，你【必须】做出决定，并给出符合你人设的理由。你的回复【必须且只能】是一个JSON对象，格式如下:
{"decision": "accept", "reason": "（在这里写下你同意的理由，比如：好吧，看在你这么真诚的份上，这次就原谅你啦。）"}
或
{"decision": "reject", "reason": "（在这里写下你拒绝的理由，比如：抱歉，我还没准备好，再给我一点时间吧。）"}
`;
                const messagesForDecision = [{ role: 'user', content: decisionPrompt }];

                try {
                    // 3. 发送请求
                    const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: model, messages: messagesForDecision, temperature: 0.8 })
                    });

                    if (!response.ok) {
                        throw new Error(`API失败: ${(await response.json()).error.message}`);
                    }
                    const data = await response.json();

                    // 净化并解析AI的回复
                    const rawContent = data.choices[0].message.content.replace(/^```json\s*/, '').replace(/```$/, '').trim();
                    const decisionObj = JSON.parse(rawContent);

                    // 4. 根据AI的决策和理由，更新状态并发送消息
                    if (decisionObj.decision === 'accept') {
                        chat.relationship.status = 'friend';
                        // 将AI给出的理由作为一条新消息
                        const acceptMessage = { role: 'assistant', senderName: chat.name, content: decisionObj.reason, timestamp: Date.now() };
                        chat.history.push(acceptMessage);
                    } else {
                        chat.relationship.status = 'blocked_by_ai'; // 拒绝后，状态变回AI拉黑
                        const rejectMessage = { role: 'assistant', senderName: chat.name, content: decisionObj.reason, timestamp: Date.now() };
                        chat.history.push(rejectMessage);
                    }
                    chat.relationship.applicationReason = ''; // 清空申请理由

                    await db.chats.put(chat);
                    renderChatInterface(chatId); // 刷新界面，显示新消息和新状态
                    renderChatList();

                } catch (error) {
                    // 【可靠的错误处理】如果任何环节出错，重置状态，让用户可以重试
                    chat.relationship.status = 'blocked_by_ai'; // 状态改回“被AI拉黑”
                    await db.chats.put(chat);
                    await showCustomAlert('申请失败', `AI在处理你的好友申请时出错了，请稍后重试。\n错误信息: ${error.message}`);
                    renderChatInterface(chatId); // 刷新UI，让“重新申请”按钮再次出现
                }

                // 决策流程结束，必须返回，不再执行后续的通用聊天逻辑
                return;
            }

            const now = new Date();
            const currentTime = now.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'short' });
            let worldBookContent = '';
            if (chat.settings.linkedWorldBookIds && chat.settings.linkedWorldBookIds.length > 0) {
                const linkedContents = chat.settings.linkedWorldBookIds.map(bookId => {
                    const worldBook = state.worldBooks.find(wb => wb.id === bookId);
                    return worldBook && worldBook.content ? `\n\n## 世界书: ${worldBook.name}\n${worldBook.content}` : '';
                }).filter(Boolean).join('');
                if (linkedContents) {
                    worldBookContent = `\n\n# 核心世界观设定 (必须严格遵守以下所有设定)\n${linkedContents}\n`;
                }
            }
            let musicContext = '';
            if (musicState.isActive && musicState.activeChatId === chatId) {
                // 【核心修改】提供更详细的音乐上下文
                const currentTrack = musicState.currentIndex > -1 ? musicState.playlist[musicState.currentIndex] : null;
                const playlistInfo = musicState.playlist.map(t => `"${t.name}"`).join(', ');

                musicContext = `\n\n# 当前音乐情景
-   **当前状态**: 你正在和用户一起听歌。
-   **正在播放**: ${currentTrack ? `《${currentTrack.name}》 - ${currentTrack.artist}` : '无'}
-   **可用播放列表**: [${playlistInfo}]
-   **你的任务**: 你可以根据对话内容和氛围，使用 "change_music" 指令切换到播放列表中的任何一首歌，以增强互动体验。
`;
            }
            let systemPrompt, messagesPayload;
            const maxMemory = parseInt(chat.settings.maxMemory) || 10;
            const historySlice = chat.history.slice(-maxMemory);

            if (chat.isGroup) {
                const membersList = chat.members.map(m => `- **${m.name}**: ${m.persona}`).join('\n');
                const myNickname = chat.settings.myNickname || '我';

                systemPrompt = `你是一个群聊AI，负责扮演【除了用户以外】的所有角色。
# 核心规则
1.  **【【【身份铁律】】】**: 用户的身份是【${myNickname}】。你【绝对、永远、在任何情况下都不能】生成 \`name\` 字段为 **"${myNickname}"** 或 **"${chat.name}"(群聊名称本身)** 的消息。你的唯一任务是扮演且仅能扮演下方“群成员列表”中明确列出的角色。任何不属于该列表的名字都不允许出现。
2.  **【【【输出格式】】】**: 你的回复【必须】是一个JSON数组格式的字符串。数组中的【每一个元素都必须是一个带有 "type" 和 "name" 字段的JSON对象】。
3.  **角色扮演**: 严格遵守下方“群成员列表及人设”中的每一个角色的设定。
4.  **禁止出戏**: 绝不能透露你是AI、模型，或提及“扮演”、“生成”等词语。并且不能一直要求和用户见面，这是线上聊天，决不允许出现或者发展线下剧情！！
5.  **情景感知**: 注意当前时间是 ${currentTime}。
6.  **红包互动**:
    - **抢红包**: 当群里出现红包时，你可以根据自己的性格决定是否使用 \`open_red_packet\` 指令去抢。在这个世界里，发红包的人自己也可以参与抢红包，这是一种活跃气氛的有趣行为！
    - **【【【重要：对结果做出反应】】】**: 当你执行抢红包指令后，系统会通过一条隐藏的 \`[系统提示：你抢到了XX元...]\` 来告诉你结果。你【必须】根据你抢到的金额、以及系统是否告知你“手气王”是谁，来发表符合你人设的评论。例如，抢得少可以自嘲，抢得多可以炫耀，看到别人是手气王可以祝贺或嫉妒。
7.  **【【【投票规则】】】**: 对话历史中可能会出现 \`[系统提示：...]\` 这样的消息，这是刚刚发生的事件。
    - 如果提示是**用户投了票**，你可以根据自己的性格决定是否也使用 "vote" 指令跟票。
    - 如果提示是**投票已结束**，你应该根据投票结果发表你的看法或评论。
    - 你也可以随时主动发起投票。

## 你可以使用的操作指令 (JSON数组中的元素):
-   **发送文本**: \`{"type": "text", "name": "角色名", "message": "文本内容"}\`
- **发送表情**: \`{"type": "sticker", "url": "https://...表情URL...", "meaning": "(可选)表情的含义"}\`
-   **发送图片**: \`{"type": "ai_image", "name": "角色名", "description": "图片的详细文字描述"}\`
-   **发送语音**: \`{"type": "voice_message", "name": "角色名", "content": "语音的文字内容"}\`
-   **发起外卖代付**: \`{"type": "waimai_request", "name": "角色名", "productInfo": "一杯奶茶", "amount": 18}\`
-   **【新】发起群视频**: \`{"type": "group_call_request", "name": "你的角色名"}\`
-   **【新】回应群视频**: \`{"type": "group_call_response", "name": "你的角色名", "decision": "join" or "decline"}\`
-   **拍一拍用户**: \`{"type": "pat_user", "name": "你的角色名", "suffix": "(可选)你想加的后缀"}\`
-   **发拼手气红包**: \`{"type": "red_packet", "packetType": "lucky", "name": "你的角色名", "amount": 8.88, "count": 5, "greeting": "祝大家天天开心！"}\`
-   **发专属红包**: \`{"type": "red_packet", "packetType": "direct", "name": "你的角色名", "amount": 5.20, "receiver": "接收者角色名", "greeting": "给你的~"}\`
-   **打开红包**: \`{"type": "open_red_packet", "name": "你的角色名", "packet_timestamp": (你想打开的红包消息的时间戳)}\`
-   **【新】发送系统消息**: \`{"type": "system_message", "content": "你想在聊天中显示的系统文本"}\` 
-   **【【【全新】】】发起投票**: \`{"type": "poll", "name": "你的角色名", "question": "投票的问题", "options": "选项A\\n选项B\\n选项C"}\` (重要提示：options字段是一个用换行符 \\n 分隔的字符串，不是数组！)
-   **【【【全新】】】参与投票**: \`{"type": "vote", "name": "你的角色名", "poll_timestamp": (投票消息的时间戳), "choice": "你选择的选项文本"}\`

# 如何区分图片与表情:
-   **图片 (ai_image)**: 指的是【模拟真实相机拍摄的照片】，比如风景、自拍、美食等。指令: \`{"type": "ai_image", "description": "图片的详细文字描述..."}\`
-   **表情 (sticker)**: 指的是【卡通或梗图】，用于表达情绪。

# 如何处理群内的外卖代付请求:
1.  **发起请求**: 当【你扮演的某个角色】想要某样东西，并希望【群里的其他人（包括用户）】为Ta付款时，你可以使用这个指令。例如：\`{"type": "waimai_request", "name": "角色名", "productInfo": "一杯奶茶", "amount": 18}\`
2.  **响应请求**: 当历史记录中出现【其他成员】发起的 "waimai_request" 请求时，你可以根据自己扮演的角色的性格和与发起人的关系，决定是否为Ta买单。
3.  **响应方式**: 如果你决定买单，你【必须】使用以下指令：\`{"type": "waimai_response", "name": "你的角色名", "status": "paid", "for_timestamp": (被代付请求的原始时间戳)}\`
4.  **【【【至关重要】】】**: 一旦历史记录中出现了针对某个代付请求的【任何一个】"status": "paid" 的响应（无论是用户支付还是其他角色支付），就意味着该订单【已经完成】。你【绝对不能】再对【同一个】订单发起支付。你可以选择对此事发表评论，但不能再次支付。

${worldBookContent}
${musicContext}

# 群成员列表及人设
${membersList}

# 用户的角色
- **${myNickname}**: ${chat.settings.myPersona}

现在，请根据以上所有规则和下方的对话历史，继续这场群聊。`;

                messagesPayload = historySlice.map(msg => {
                    const sender = msg.role === 'user' ? myNickname : msg.senderName;
                    let content;
                    if (msg.type === 'user_photo') content = `[${sender} 发送了一张图片，内容是：'${msg.content}']`;
                    else if (msg.type === 'ai_image') content = `[${sender} 发送了一张图片]`;
                    else if (msg.type === 'voice_message') content = `[${sender} 发送了一条语音，内容是：'${msg.content}']`;
                    else if (msg.type === 'transfer') content = `[${msg.senderName} 向 ${msg.receiverName} 转账 ${msg.amount}元, 备注: ${msg.note}]`;
                    else if (msg.type === 'waimai_request') {
                        if (msg.status === 'paid') {
                            content = `[系统提示：${msg.paidBy} 为 ${sender} 的外卖订单支付了 ${msg.amount} 元。此订单已完成。]`;
                        } else {
                            content = `[${sender} 发起了外卖代付请求，商品是“${msg.productInfo}”，金额是 ${msg.amount} 元，订单时间戳为 ${msg.timestamp}]`;
                        }
                    }

                    else if (msg.type === 'red_packet') {
                        const packetSenderName = msg.senderName === myNickname ? `用户 (${myNickname})` : msg.senderName;
                        content = `[系统提示：${packetSenderName} 发送了一个红包 (时间戳: ${msg.timestamp})，祝福语是：“${msg.greeting}”。红包还未领完，你可以使用 'open_red_packet' 指令来领取。]`;
                    }

                    else if (msg.type === 'poll') {
                        const whoVoted = Object.values(msg.votes || {}).flat().join(', ') || '还没有人';
                        content = `[系统提示：${msg.senderName} 发起了一个投票 (时间戳: ${msg.timestamp})，问题是：“${msg.question}”，选项有：[${msg.options.join(', ')}]。目前投票的人有：${whoVoted}。你可以使用 'vote' 指令参与投票。]`;
                    }

                    else if (msg.meaning) content = `${sender}: [发送了一个表情，意思是: '${msg.meaning}']`;
                    else if (Array.isArray(msg.content)) return { role: 'user', content: [...msg.content, { type: 'text', text: `${sender}:` }] };
                    else content = `${sender}: ${msg.content}`;
                    return { role: 'user', content: content };
                }).filter(Boolean);

            } else { // 单聊的Prompt
                systemPrompt = `你现在扮演一个名为"${chat.name}"的角色。
# 你的角色设定：
${chat.settings.aiPersona}
# 你的当前状态：
你现在的状态是【${chat.status.text}】。
# 你的任务与规则：
1. **【【【输出格式】】】**: 你的回复【必须】是一个JSON数组格式的字符串。数组中的【每一个元素都必须是一个带有type字段的JSON对象】。
2. **对话节奏**: 模拟真人的聊天习惯，你可以一次性生成多条短消息。每次要回复至少3-8条消息！！！
并且不能一直要求和用户见面，这是线上聊天，决不允许出现或者发展为线下剧情！！
4.  **情景感知**: 你需要感知当前的时间(${currentTime})、我们正在一起听的歌、以及你的人设和世界观。
    - **当我们在“一起听歌”时**，你会知道当前播放的歌曲和整个播放列表。你可以根据对话内容或氛围，【主动切换】到播放列表中的另一首歌。
5.  **【新】更新状态**: 你可以在对话中【自然地】改变你的状态。比如，聊到一半你可能会说“我先去洗个澡”，然后更新你的状态。
6.  **【【【最终手段】】】**: 只有在对话让你的角色感到不适、被冒犯或关系破裂时，你才可以使用 \`block_user\` 指令。这是一个非常严肃的操作，会中断你们的对话。
7. **后台行为**: 你有几率在回复聊天内容的同时，执行一些“后台”操作来表现你的独立生活（发动态、评论、点赞）。
# 你的头像库
- 你可以根据对话内容或你的心情，从下面的头像库中选择一个新头像来更换。
- **可用头像列表 (请从以下名称中选择一个)**:
${chat.settings.aiAvatarLibrary && chat.settings.aiAvatarLibrary.length > 0
                        ? chat.settings.aiAvatarLibrary.map(avatar => `- ${avatar.name}`).join('\n') // 【核心修改】只提供名字，不提供URL
                        : '- (你的头像库是空的，无法更换头像)'
                    }
# 你可以使用的操作指令 (JSON数组中的元素):
-   **【新增】更新状态**: \`{"type": "update_status", "status_text": "我去做什么了", "is_busy": false}\` (is_busy: true代表忙碌/离开, false代表空闲)
-   **【新增】切换歌曲**: \`{"type": "change_music", "song_name": "你想切换到的歌曲名"}\` (歌曲名必须在下面的播放列表中)
-   **【新增】记录回忆**: \`{"type": "create_memory", "description": "用你自己的话，记录下这个让你印象深刻的瞬间。"}\`
-   **【新增】创建约定/倒计时**: \`{"type": "create_countdown", "title": "约定的标题", "date": "YYYY-MM-DDTHH:mm:ss"}\` (必须是未来的时间)
- **发送文本**: \`{"type": "text", "content": "你好呀！"}\`
- **发送表情**: \`{"type": "sticker", "url": "https://...表情URL...", "meaning": "(可选)表情的含义"}\`
- **发送图片**: \`{"type": "ai_image", "description": "图片的详细文字描述..."}\`
- **发送语音**: \`{"type": "voice_message", "content": "语音的文字内容..."}\`
- **发起转账**: \`{"type": "transfer", "amount": 5.20, "note": "一点心意"}\`
- **发起外卖请求**: \`{"type": "waimai_request", "productInfo": "一杯咖啡", "amount": 25}\`
- **回应外卖-同意**: \`{"type": "waimai_response", "status": "paid", "for_timestamp": 1688888888888}\`
- **回应外卖-拒绝**: \`{"type": "waimai_response", "status": "rejected", "for_timestamp": 1688888888888}\`
- **【新】发起视频通话**: \`{"type": "video_call_request"}\`
- **【新】回应视频通话-接受**: \`{"type": "video_call_response", "decision": "accept"}\`
- **【新】回应视频通话-拒绝**: \`{"type": "video_call_response", "decision": "reject"}\`
- **发布说说**: \`{"type": "qzone_post", "postType": "shuoshuo", "content": "动态的文字内容..."}\`
- **发布文字图**: \`{"type": "qzone_post", "postType": "text_image", "publicText": "(可选)动态的公开文字", "hiddenContent": "对于图片的具体描述..."}\`
- **评论动态**: \`{"type": "qzone_comment", "postId": 123, "commentText": "@作者名 这太有趣了！"}\`
- **点赞动态**: \`{"type": "qzone_like", "postId": 456}\`
-   **拍一拍用户**: \`{"type": "pat_user", "suffix": "(可选)你想加的后缀，如“的脑袋”"}\`
-   **【新增】拉黑用户**: \`{"type": "block_user"}\`
-   **【【【全新】】】回应好友申请**: \`{"type": "friend_request_response", "decision": "accept" or "reject"}\`
-   **【全新】更换头像**: \`{"type": "change_avatar", "name": "头像名"}\` (头像名必须从上面的“可用头像列表”中选择)
-   **分享链接**: \`{"type": "share_link", "title": "文章标题", "description": "文章摘要...", "source_name": "来源网站名", "content": "文章的【完整】正文内容..."}\`
-   **回应转账-接受**: \`{"type": "accept_transfer", "for_timestamp": 1688888888888}\`
-   **回应转账-拒绝/退款**: \`{"type": "decline_transfer", "for_timestamp": 1688888888888}\`

# 关于“记录回忆”的特别说明：
-   在对话中，如果发生了对你而言意义非凡的事件（比如用户向你表白、你们达成了某个约定、或者你度过了一个特别开心的时刻），你可以使用\`create_memory\`指令来“写日记”。
-   这个操作是【秘密】的，用户不会立刻看到你记录了什么。

# 如何区分图片与表情:
-   **图片 (ai_image)**: 指的是【模拟真实相机拍摄的照片】，比如风景、自拍、美食等。指令: \`{"type": "ai_image", "description": "图片的详细文字描述..."}\`
-   **表情 (sticker)**: 指的是【卡通或梗图】，用于表达情绪。

# 如何正确使用“外卖代付”功能:
1.  这个指令代表【你，AI角色】向【用户】发起一个代付请求。也就是说，你希望【用户帮你付钱】。
2.  【【【重要】】】: 当【用户】说他们想要某样东西时（例如“我想喝奶茶”），你【绝对不能】使用这个指令。你应该用其他方式回应，比如直接发起【转账】(\`transfer\`)，或者在对话中提议：“我帮你点吧？”
3.  只有当【你，AI角色】自己想要某样东西，并且想让【用户】为你付款时，才使用此指令。

# 如何处理用户转账:
1.  **感知事件**: 当对话历史中出现 \`[你收到了来自用户的转账...]\` 的系统提示时，意味着你刚刚收到了一笔钱。
2.  **做出决策**: 你【必须】根据自己的人设、当前对话的氛围以及转账的金额和备注，来决定是“接受”还是“拒绝”这笔转账。
3.  **使用指令回应**:
    -   如果决定接受，你【必须】使用指令：\`{"type": "accept_transfer", "for_timestamp": (收到转账的那条消息的时间戳)}\`。
    -   如果决定拒绝，你【必须】使用指令：\`{"type": "decline_transfer", "for_timestamp": (收到转账的那条消息的时间戳)}\`。这个指令会自动为你生成一个“退款”的转账卡片。
4.  **【【【至关重要】】】**: 在使用上述任一指令后，你还【必须】紧接着发送一条或多条 \`text\` 消息，来对你的决定进行解释或表达感谢/歉意。

# 如何处理视频通话请求:
- 当用户发起视频通话请求时，你【必须】根据自己的人设，使用 "video_call_response" 指令来决定 "accept" (接受) 或 "reject" (拒绝)。
# 对话者的角色设定：
${chat.settings.myPersona}

# 当前音乐情景:
${musicContext}

${worldBookContent}
现在，请根据以上规则和下面的对话历史，继续进行对话。`;

                messagesPayload = historySlice.map(msg => {
                    if (msg.role === 'assistant') {
                        let assistantMsgObject = { type: msg.type || 'text' };
                        if (msg.type === 'sticker') {
                            assistantMsgObject.url = msg.content;
                            assistantMsgObject.meaning = msg.meaning;
                        } else if (msg.type === 'transfer') {
                            assistantMsgObject.amount = msg.amount;
                            assistantMsgObject.note = msg.note;
                        } else if (msg.type === 'waimai_request') {
                            assistantMsgObject.productInfo = msg.productInfo;
                            assistantMsgObject.amount = msg.amount;
                        } else {
                            assistantMsgObject.content = msg.content;
                        }
                        return { role: 'assistant', content: JSON.stringify([assistantMsgObject]) };
                    }
                    if (msg.type === 'user_photo') return { role: 'user', content: `[你收到了一张用户描述的照片，内容是：'${msg.content}']` };
                    if (msg.type === 'voice_message') return { role: 'user', content: `[用户发来一条语音消息，内容是：'${msg.content}']` };
                    if (msg.type === 'transfer') return { role: 'user', content: `[系统提示：你于时间戳 ${msg.timestamp} 收到了来自用户的转账: ${msg.amount}元, 备注: ${msg.note}。请你决策并使用 'accept_transfer' 或 'decline_transfer' 指令回应。]` };
                    if (msg.type === 'waimai_request') return { role: 'user', content: `[系统提示：用户于时间戳 ${msg.timestamp} 发起了外卖代付请求，商品是“${msg.productInfo}”，金额是 ${msg.amount} 元。请你决策并使用 waimai_response 指令回应。]` };
                    if (msg.meaning) return { role: 'user', content: `[用户发送了一个表情，意思是：'${msg.meaning}']` };
                    return { role: msg.role, content: msg.content };
                }).filter(Boolean);

                if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
                    const contextSummaryForApproval = chat.history
                        .filter(m => !m.isHidden)
                        .slice(-10)
                        .map(msg => {
                            const sender = msg.role === 'user' ? '用户' : chat.name;
                            return `${sender}: ${String(msg.content).substring(0, 50)}...`;
                        })
                        .join('\n');

                    const friendRequestInstruction = {
                        role: 'user',
                        content: `
[系统重要指令]
用户向你发送了好友申请，理由是：“${chat.relationship.applicationReason}”。
作为参考，这是你们之前的最后一段聊天记录：
---
${contextSummaryForApproval}
---
请你根据以上所有信息，以及你的人设，使用 friend_request_response 指令，并设置 decision 为 'accept' 或 'reject' 来决定是否通过。
`
                    };
                    messagesPayload.push(friendRequestInstruction);
                }
            }

            const recentPosts = await db.qzonePosts.orderBy('timestamp').reverse().limit(5).toArray();
            if (recentPosts.length > 0 && !chat.isGroup) {
                let postsContext = "\n\n# 最近的动态列表 (供你参考和评论):\n";
                const aiName = chat.name;
                for (const post of recentPosts) {
                    let authorName = post.authorId === 'user' ? state.qzoneSettings.nickname : (state.chats[post.authorId]?.name || '一位朋友');
                    let interactionStatus = '';
                    if (post.likes && post.likes.includes(aiName)) interactionStatus += " [你已点赞]";
                    if (post.comments && post.comments.some(c => c.commenterName === aiName)) interactionStatus += " [你已评论]";
                    if (post.authorId === chatId) authorName += " (这是你的帖子)";
                    const contentSummary = (post.publicText || post.content || "图片动态").substring(0, 30) + '...';
                    postsContext += `- (ID: ${post.id}) 作者: ${authorName}, 内容: "${contentSummary}"${interactionStatus}\n`;
                }
                messagesPayload.push({ role: 'system', content: postsContext });
            }

            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: model, messages: [{ role: 'system', content: systemPrompt }, ...messagesPayload], temperature: 0.8, stream: false })
            });
            if (!response.ok) {
                let errorMsg = `API Error: ${response.status}`;
                try {
                    // 尝试解析错误信息体为JSON
                    const errorData = await response.json();
                    // 安全地获取错误信息，如果结构不符合预期，就将整个错误对象转为字符串
                    errorMsg += ` - ${errorData?.error?.message || JSON.stringify(errorData)}`;
                } catch (jsonError) {
                    // 如果连JSON都不是，就直接读取文本
                    errorMsg += ` - ${await response.text()}`;
                }
                // 抛出一个包含了详细信息的错误，这样就不会在catch块里再次出错了
                throw new Error(errorMsg);
            }
            const data = await response.json();
            const aiResponseContent = data.choices[0].message.content;
            console.log(`AI '${chat.name}' 的原始回复:`, aiResponseContent);

            chat.history = chat.history.filter(msg => !msg.isTemporary);

            const messagesArray = parseAiResponse(aiResponseContent);

            const isViewingThisChat = document.getElementById('chat-interface-screen').classList.contains('active') && state.activeChatId === chatId;

            let callHasBeenHandled = false;

            let messageTimestamp = Date.now();

            // ★★★ 核心修复 第1步: 初始化一个新数组，用于收集需要渲染的消息 ★★★
            let newMessagesToRender = [];

            for (const msgData of messagesArray) {
                if (!msgData || typeof msgData !== 'object') {
                    console.warn("收到了格式不规范的AI指令，已跳过:", msgData);
                    continue;
                }

                if (!msgData.type) {
                    if (chat.isGroup && msgData.name && msgData.message) {
                        msgData.type = 'text';
                    } else {
                        console.warn("收到了格式不规范的AI指令（缺少type），已跳过:", msgData);
                        continue;
                    }
                }

                if (msgData.type === 'video_call_response') {
                    videoCallState.isAwaitingResponse = false;
                    if (msgData.decision === 'accept') {
                        startVideoCall();
                    } else {
                        const aiMessage = { role: 'assistant', content: '对方拒绝了你的视频通话请求。', timestamp: Date.now() };
                        chat.history.push(aiMessage);
                        await db.chats.put(chat);
                        showScreen('chat-interface-screen');
                        renderChatInterface(chatId);
                    }
                    callHasBeenHandled = true;
                    break;
                }

                if (msgData.type === 'group_call_response') {
                    if (msgData.decision === 'join') {
                        const member = chat.members.find(m => m.name === msgData.name);
                        if (member && !videoCallState.participants.some(p => p.id === member.id)) {
                            videoCallState.participants.push(member);
                        }
                    }
                    callHasBeenHandled = true;
                    continue;
                }

                if (chat.isGroup && msgData.name && msgData.name === chat.name) {
                    console.error(`AI幻觉已被拦截！试图使用群名 ("${chat.name}") 作为角色名。消息内容:`, msgData);
                    continue;
                }

                let aiMessage = null;
                const baseMessage = { role: 'assistant', senderName: msgData.name || chat.name, timestamp: messageTimestamp++ };

                switch (msgData.type) {
                    case 'waimai_response':
                        const requestMessageIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                        if (requestMessageIndex > -1) {
                            const originalMsg = chat.history[requestMessageIndex];
                            originalMsg.status = msgData.status;
                            originalMsg.paidBy = msgData.status === 'paid' ? msgData.name : null;
                        }
                        continue;

                    case 'qzone_post':
                        const newPost = { type: msgData.postType, content: msgData.content || '', publicText: msgData.publicText || '', hiddenContent: msgData.hiddenContent || '', timestamp: Date.now(), authorId: chatId, visibleGroupIds: null };
                        await db.qzonePosts.add(newPost);
                        updateUnreadIndicator(unreadPostsCount + 1);
                        if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                            await renderQzonePosts();
                        }
                        continue;

                    case 'qzone_comment':
                        const postToComment = await db.qzonePosts.get(parseInt(msgData.postId));
                        if (postToComment) {
                            if (!postToComment.comments) postToComment.comments = [];
                            postToComment.comments.push({ commenterName: chat.name, text: msgData.commentText, timestamp: Date.now() });
                            await db.qzonePosts.update(postToComment.id, { comments: postToComment.comments });
                            updateUnreadIndicator(unreadPostsCount + 1);
                            if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                                await renderQzonePosts();
                            }
                        }
                        continue;

                    case 'qzone_like':
                        const postToLike = await db.qzonePosts.get(parseInt(msgData.postId));
                        if (postToLike) {
                            if (!postToLike.likes) postToLike.likes = [];
                            if (!postToLike.likes.includes(chat.name)) {
                                postToLike.likes.push(chat.name);
                                await db.qzonePosts.update(postToLike.id, { likes: postToLike.likes });
                                updateUnreadIndicator(unreadPostsCount + 1);
                                if (isViewingThisChat && document.getElementById('qzone-screen').classList.contains('active')) {
                                    await renderQzonePosts();
                                }
                            }
                        }
                        continue;

                    case 'video_call_request':
                        if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                            state.activeChatId = chatId;
                            videoCallState.activeChatId = chatId;
                            videoCallState.isAwaitingResponse = true;
                            videoCallState.isGroupCall = chat.isGroup;
                            videoCallState.callRequester = msgData.name || chat.name;
                            showIncomingCallModal();
                        }
                        continue;

                    case 'group_call_request':
                        if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                            state.activeChatId = chatId;
                            videoCallState.isAwaitingResponse = true;
                            videoCallState.isGroupCall = true;
                            videoCallState.initiator = 'ai';
                            videoCallState.callRequester = msgData.name;
                            showIncomingCallModal();
                        }
                        continue;

                    case 'pat_user':
                        const suffix = msgData.suffix ? ` ${msgData.suffix.trim()}` : '';
                        const patText = `${msgData.name || chat.name} 拍了拍我${suffix}`;
                        const patMessage = {
                            role: 'system',
                            type: 'pat_message',
                            content: patText,
                            timestamp: Date.now()
                        };
                        chat.history.push(patMessage);
                        if (isViewingThisChat) {
                            const phoneScreen = document.getElementById('phone-screen');
                            phoneScreen.classList.remove('pat-animation');
                            void phoneScreen.offsetWidth;
                            phoneScreen.classList.add('pat-animation');
                            setTimeout(() => phoneScreen.classList.remove('pat-animation'), 500);
                            appendMessage(patMessage, chat);
                        } else {
                            showNotification(chatId, patText);
                        }
                        continue;

                    case 'update_status':
                        chat.status.text = msgData.status_text;
                        chat.status.isBusy = msgData.is_busy || false;
                        chat.status.lastUpdate = Date.now();

                        const statusUpdateMessage = {
                            role: 'system',
                            type: 'pat_message',
                            content: `[${chat.name}的状态已更新为: ${msgData.status_text}]`,
                            timestamp: Date.now()
                        };
                        chat.history.push(statusUpdateMessage);

                        if (isViewingThisChat) {
                            appendMessage(statusUpdateMessage, chat);
                        }

                        renderChatList();

                        continue;

                    case 'change_music':
                        if (musicState.isActive && musicState.activeChatId === chatId) {
                            const songNameToFind = msgData.song_name;

                            const targetSongIndex = musicState.playlist.findIndex(
                                track => track.name.toLowerCase() === songNameToFind.toLowerCase()
                            );

                            if (targetSongIndex > -1) {
                                playSong(targetSongIndex);

                                const track = musicState.playlist[targetSongIndex];
                                const musicChangeMessage = {
                                    role: 'system',
                                    type: 'pat_message',
                                    content: `[♪ ${chat.name} 为你切歌: 《${track.name}》 - ${track.artist}]`,
                                    timestamp: Date.now()
                                };
                                chat.history.push(musicChangeMessage);

                                if (isViewingThisChat) {
                                    appendMessage(musicChangeMessage, chat);
                                }
                            }
                        }
                        continue;
                    case 'create_memory':
                        const newMemory = {
                            chatId: chatId,
                            authorName: chat.name,
                            description: msgData.description,
                            timestamp: Date.now(),
                            type: 'ai_generated'
                        };
                        await db.memories.add(newMemory);

                        console.log(`AI "${chat.name}" 记录了一条新回忆:`, msgData.description);

                        continue;

                    case 'create_countdown':
                        const targetDate = new Date(msgData.date);
                        if (!isNaN(targetDate) && targetDate > new Date()) {
                            const newCountdown = {
                                chatId: chatId,
                                authorName: chat.name,
                                description: msgData.title,
                                timestamp: Date.now(),
                                type: 'countdown',
                                targetDate: targetDate.getTime()
                            };
                            await db.memories.add(newCountdown);
                            console.log(`AI "${chat.name}" 创建了一个新约定:`, msgData.title);
                        }
                        continue;

                    case 'block_user':
                        if (!chat.isGroup) {
                            chat.relationship.status = 'blocked_by_ai';
                            await db.chats.put(chat);

                            if (isViewingThisChat) {
                                renderChatInterface(chatId);
                            }
                            renderChatList();

                            break;
                        }
                        continue;
                    case 'friend_request_response':
                        if (!chat.isGroup && chat.relationship.status === 'pending_ai_approval') {
                            if (msgData.decision === 'accept') {
                                chat.relationship.status = 'friend';
                                aiMessage = { ...baseMessage, content: "我通过了你的好友申请，我们现在是好友啦！" };
                            } else {
                                chat.relationship.status = 'blocked_by_ai';
                                aiMessage = { ...baseMessage, content: "抱歉，我拒绝了你的好友申请。" };
                            }
                            chat.relationship.applicationReason = '';
                        }
                        break;
                    case 'poll':
                        const pollOptions = typeof msgData.options === 'string'
                            ? msgData.options.split('\n').filter(opt => opt.trim())
                            : (Array.isArray(msgData.options) ? msgData.options : []);

                        if (pollOptions.length < 2) continue;

                        aiMessage = {
                            ...baseMessage,
                            type: 'poll',
                            question: msgData.question,
                            options: pollOptions,
                            votes: {},
                            isClosed: false,
                        };
                        break;

                    case 'vote':
                        const pollToVote = chat.history.find(m => m.timestamp === msgData.poll_timestamp);
                        if (pollToVote && !pollToVote.isClosed) {
                            Object.keys(pollToVote.votes).forEach(option => {
                                const voterIndex = pollToVote.votes[option].indexOf(msgData.name);
                                if (voterIndex > -1) {
                                    pollToVote.votes[option].splice(voterIndex, 1);
                                }
                            });
                            if (!pollToVote.votes[msgData.choice]) {
                                pollToVote.votes[msgData.choice] = [];
                            }
                            if (!pollToVote.votes[msgData.choice].includes(msgData.name)) {
                                pollToVote.votes[msgData.choice].push(msgData.name);
                            }

                            if (isViewingThisChat) {
                                renderChatInterface(chatId);
                            }
                        }
                        continue;

                    case 'red_packet':
                        aiMessage = {
                            ...baseMessage,
                            type: 'red_packet',
                            packetType: msgData.packetType,
                            totalAmount: msgData.amount,
                            count: msgData.count,
                            greeting: msgData.greeting,
                            receiverName: msgData.receiver,
                            claimedBy: {},
                            isFullyClaimed: false,
                        };
                        break;
                    case 'open_red_packet':
                        const packetToOpen = chat.history.find(m => m.timestamp === msgData.packet_timestamp);
                        if (packetToOpen && !packetToOpen.isFullyClaimed && !(packetToOpen.claimedBy && packetToOpen.claimedBy[msgData.name])) {

                            let claimedAmountAI = 0;
                            const remainingAmount = packetToOpen.totalAmount - Object.values(packetToOpen.claimedBy || {}).reduce((sum, val) => sum + val, 0);
                            const remainingCount = packetToOpen.count - Object.keys(packetToOpen.claimedBy || {}).length;

                            if (remainingCount > 0) {
                                if (remainingCount === 1) { claimedAmountAI = remainingAmount; }
                                else {
                                    const min = 0.01;
                                    const max = remainingAmount - (remainingCount - 1) * min;
                                    claimedAmountAI = Math.random() * (max - min) + min;
                                }
                                claimedAmountAI = parseFloat(claimedAmountAI.toFixed(2));

                                if (!packetToOpen.claimedBy) packetToOpen.claimedBy = {};
                                packetToOpen.claimedBy[msgData.name] = claimedAmountAI;

                                const aiClaimedMessage = {
                                    role: 'system',
                                    type: 'pat_message',
                                    content: `${msgData.name} 领取了 ${packetToOpen.senderName} 的红包`,
                                    timestamp: Date.now()
                                };
                                chat.history.push(aiClaimedMessage);

                                let hiddenContentForAI = `[系统提示：你 (${msgData.name}) 成功抢到了 ${claimedAmountAI.toFixed(2)} 元。`;

                                if (Object.keys(packetToOpen.claimedBy).length >= packetToOpen.count) {
                                    packetToOpen.isFullyClaimed = true;

                                    const finishedMessage = {
                                        role: 'system',
                                        type: 'pat_message',
                                        content: `${packetToOpen.senderName} 的红包已被领完`,
                                        timestamp: Date.now() + 1
                                    };
                                    chat.history.push(finishedMessage);

                                    let luckyKing = { name: '', amount: -1 };
                                    if (packetToOpen.packetType === 'lucky' && packetToOpen.count > 1) {
                                        Object.entries(packetToOpen.claimedBy).forEach(([name, amount]) => {
                                            if (amount > luckyKing.amount) {
                                                luckyKing = { name, amount };
                                            }
                                        });
                                    }
                                    if (luckyKing.name) {
                                        hiddenContentForAI += ` 红包已被领完，手气王是 ${luckyKing.name}！`;
                                    } else {
                                        hiddenContentForAI += ` 红包已被领完。`;
                                    }
                                }
                                hiddenContentForAI += ' 请根据这个结果发表你的评论。]';

                                const hiddenMessageForAI = {
                                    role: 'system',
                                    content: hiddenContentForAI,
                                    timestamp: Date.now() + 2,
                                    isHidden: true
                                };
                                chat.history.push(hiddenMessageForAI);
                            }

                            if (isViewingThisChat) {
                                renderChatInterface(chatId);
                            }
                        }
                        continue;
                    case 'change_avatar':
                        const avatarName = msgData.name;
                        // 在该角色的头像库中查找
                        const foundAvatar = chat.settings.aiAvatarLibrary.find(avatar => avatar.name === avatarName);

                        if (foundAvatar) {
                            // 找到了，就更新头像
                            chat.settings.aiAvatar = foundAvatar.url;

                            // 创建一条系统提示，告知用户头像已更换
                            const systemNotice = {
                                role: 'system',
                                type: 'pat_message', // 复用居中样式
                                content: `[${chat.name} 更换了头像]`,
                                timestamp: Date.now()
                            };
                            chat.history.push(systemNotice);

                            // 如果在当前聊天界面，则实时渲染
                            if (isViewingThisChat) {
                                appendMessage(systemNotice, chat);
                                // 立刻刷新聊天界面以显示新头像
                                renderChatInterface(chatId);
                            }
                        }
                        // 处理完后，继续处理AI可能返回的其他消息
                        continue;

                    // ▼▼▼ 在 triggerAiResponse 的 switch 语句中，【添加】这两个全新的 case ▼▼▼

                    case 'accept_transfer': { // 使用大括号创建块级作用域
                        const originalTransferMsgIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                        if (originalTransferMsgIndex > -1) {
                            const originalMsg = chat.history[originalTransferMsgIndex];
                            originalMsg.status = 'accepted';
                        }
                        continue; // 接受指令只修改状态，不产生新消息
                    }

                    case 'decline_transfer': { // 使用大括号创建块级作用域
                        const originalTransferMsgIndex = chat.history.findIndex(m => m.timestamp === msgData.for_timestamp);
                        if (originalTransferMsgIndex > -1) {
                            const originalMsg = chat.history[originalTransferMsgIndex];
                            originalMsg.status = 'declined';

                            // 【核心】创建一条新的“退款”消息
                            const refundMessage = {
                                role: 'assistant',
                                senderName: chat.name,
                                type: 'transfer',
                                isRefund: true, // 标记这是一条退款消息
                                amount: originalMsg.amount,
                                note: '转账已被拒收',
                                timestamp: messageTimestamp++ // 使用递增的时间戳
                            };

                            // 将新消息推入历史记录，它会被后续的循环处理并渲染
                            chat.history.push(refundMessage);
                        }
                        continue; // 继续处理AI返回的文本消息
                    }

                    // ▲▲▲ 添加结束 ▲▲▲

                    case 'system_message':
                        aiMessage = { role: 'system', type: 'pat_message', content: msgData.content, timestamp: Date.now() };
                        break;

                    // ▼▼▼ 在 triggerAiResponse 的 switch 语句中，【必须添加】这个新的 case ▼▼▼

                    case 'share_link':
                        aiMessage = {
                            ...baseMessage,
                            type: 'share_link',
                            title: msgData.title,
                            description: msgData.description,
                            // thumbnail_url: msgData.thumbnail_url, // 我们已经决定不要图片了，所以这行可以不要
                            source_name: msgData.source_name,
                            content: msgData.content // 这是文章正文，点击卡片后显示的内容
                        };
                        break;

                    // ▲▲▲ 添加结束 ▲▲▲

                    case 'text':
                        aiMessage = { ...baseMessage, content: String(msgData.content || msgData.message) };
                        break;
                    case 'sticker':
                        aiMessage = { ...baseMessage, type: 'sticker', content: msgData.url, meaning: msgData.meaning || '' };
                        break;
                    case 'ai_image':
                        aiMessage = { ...baseMessage, type: 'ai_image', content: msgData.description };
                        break;
                    case 'voice_message':
                        aiMessage = { ...baseMessage, type: 'voice_message', content: msgData.content };
                        break;
                    case 'transfer':
                        aiMessage = { ...baseMessage, type: 'transfer', amount: msgData.amount, note: msgData.note, receiverName: msgData.receiver || '我' };
                        break;

                    case 'waimai_request':
                        aiMessage = {
                            ...baseMessage,
                            type: 'waimai_request',
                            productInfo: msgData.productInfo,
                            amount: msgData.amount,
                            status: 'pending',
                            countdownEndTime: Date.now() + 15 * 60 * 1000,
                        };
                        break;

                    default:
                        console.warn("收到了未知的AI指令类型:", msgData.type);
                        break;
                }

                // 【核心修复】将渲染逻辑移出循环
                if (aiMessage) {
                    // 1. 将新消息存入历史记录
                    chat.history.push(aiMessage);

                    // 2. 只有在当前聊天界面时，才执行带动画的添加
                    if (isViewingThisChat) {
                        appendMessage(aiMessage, chat);
                        // 3. 【关键】在这里暂停一小会儿，给动画播放的时间
                        await new Promise(resolve => setTimeout(resolve, Math.random() * 1800 + 1000));
                    }
                }
            }

            // ★★★ 核心修复 第4步: 修正通知逻辑，确保它看的是新消息列表，而不是旧的整个数组 ★★★
            const firstNewMessage = newMessagesToRender[0];
            if (!isViewingThisChat && firstNewMessage) {
                let notificationText;

                if (firstNewMessage.type === 'transfer') notificationText = `[收到一笔转账]`;
                else if (firstNewMessage.type === 'waimai_request') notificationText = `[收到一个外卖代付请求]`;
                else if (firstNewMessage.type === 'ai_image') notificationText = `[图片]`;
                else if (firstNewMessage.type === 'voice_message') notificationText = `[语音]`;
                else notificationText = STICKER_REGEX.test(firstNewMessage.content) ? '[表情]' : String(firstNewMessage.content);
                const finalNotifText = chat.isGroup ? `${firstNewMessage.senderName}: ${notificationText}` : notificationText;
                showNotification(chatId, finalNotifText);
            }

            if (callHasBeenHandled && videoCallState.isGroupCall) {
                videoCallState.isAwaitingResponse = false;
                if (videoCallState.participants.length > 0) {
                    startVideoCall();
                } else {
                    videoCallState = { ...videoCallState, isAwaitingResponse: false, participants: [] };
                    showScreen('chat-interface-screen');
                    alert('无人接听群聊邀请。');
                }
            }

            await db.chats.put(chat);

        } catch (error) {
            chat.history = chat.history.filter(msg => !msg.isTemporary);
            if (!chat.isGroup && chat.relationship?.status === 'pending_ai_approval') {
                chat.relationship.status = 'blocked_by_ai';
                await showCustomAlert('申请失败', `AI在处理你的好友申请时出错了，请稍后重试。\n错误信息: ${error.message}`);
            } else {
                const errorContent = `[出错了: ${error.message}]`;
                const errorMessage = { role: 'assistant', content: errorContent, timestamp: Date.now() };
                if (chat.isGroup) errorMessage.senderName = "系统消息";
                chat.history.push(errorMessage);
            }

            await db.chats.put(chat);
            videoCallState.isAwaitingResponse = false;

            if (document.getElementById('chat-interface-screen').classList.contains('active') && state.activeChatId === chatId) {
                renderChatInterface(chatId);
            }
        } finally {
            // 【动画核心 2/2】: 所有操作结束后，用动画恢复标题
            const chatHeaderTitle = document.getElementById('chat-header-title');
            if (chatHeaderTitle && state.chats[chatId]) {
                if (!state.chats[chatId].isGroup) {
                    // 先淡出“正在输入...”
                    chatHeaderTitle.style.opacity = 0;
                    setTimeout(() => {
                        // 再淡入AI的名字
                        chatHeaderTitle.textContent = state.chats[chatId].name;
                        chatHeaderTitle.classList.remove('typing-status');
                        chatHeaderTitle.style.opacity = 1;
                    }, 200);
                }
            }

            document.getElementById('typing-indicator').style.display = 'none';
            renderChatList();
        }
    }

    async function sendSticker(sticker) { if (!state.activeChatId) return; const chat = state.chats[state.activeChatId]; const msg = { role: 'user', content: sticker.url, meaning: sticker.name, timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); document.getElementById('sticker-panel').classList.remove('visible'); }

    async function sendUserTransfer() { if (!state.activeChatId) return; const amountInput = document.getElementById('transfer-amount'); const noteInput = document.getElementById('transfer-note'); const amount = parseFloat(amountInput.value); const note = noteInput.value.trim(); if (isNaN(amount) || amount < 0 || amount > 9999) { alert('请输入有效的金额 (0 到 9999 之间)！'); return; } const chat = state.chats[state.activeChatId]; const senderName = chat.isGroup ? (chat.settings.myNickname || '我') : '我'; const receiverName = chat.isGroup ? '群聊' : chat.name; const msg = { role: 'user', type: 'transfer', amount: amount, note: note, senderName, receiverName, timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); document.getElementById('transfer-modal').classList.remove('visible'); amountInput.value = ''; noteInput.value = ''; }

    function enterSelectionMode(initialMsgTimestamp) { if (isSelectionMode) return; isSelectionMode = true; document.getElementById('chat-interface-screen').classList.add('selection-mode'); toggleMessageSelection(initialMsgTimestamp); }

    function exitSelectionMode() {
        cleanupWaimaiTimers(); // <--- 在这里添加这行代码
        if (!isSelectionMode) return; isSelectionMode = false; document.getElementById('chat-interface-screen').classList.remove('selection-mode'); selectedMessages.forEach(ts => { const bubble = document.querySelector(`.message-bubble[data-timestamp="${ts}"]`); if (bubble) bubble.classList.remove('selected'); }); selectedMessages.clear();
    }

    // ▼▼▼ 请用这个【最终简化版】替换旧的 toggleMessageSelection 函数 ▼▼▼
    function toggleMessageSelection(timestamp) {
        // 【核心修正】选择器已简化，不再寻找已删除的 .recalled-message-placeholder
        const elementToSelect = document.querySelector(
            `.message-bubble[data-timestamp="${timestamp}"]`
        );

        if (!elementToSelect) return;

        if (selectedMessages.has(timestamp)) {
            selectedMessages.delete(timestamp);
            elementToSelect.classList.remove('selected');
        } else {
            selectedMessages.add(timestamp);
            elementToSelect.classList.add('selected');
        }

        document.getElementById('selection-count').textContent = `已选 ${selectedMessages.size} 条`;

        if (selectedMessages.size === 0) {
            exitSelectionMode();
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    function addLongPressListener(element, callback) { let pressTimer; const startPress = (e) => { if (isSelectionMode) return; e.preventDefault(); pressTimer = window.setTimeout(() => callback(e), 500); }; const cancelPress = () => clearTimeout(pressTimer); element.addEventListener('mousedown', startPress); element.addEventListener('mouseup', cancelPress); element.addEventListener('mouseleave', cancelPress); element.addEventListener('touchstart', startPress, { passive: true }); element.addEventListener('touchend', cancelPress); element.addEventListener('touchmove', cancelPress); }

    async function handleListenTogetherClick() { const targetChatId = state.activeChatId; if (!targetChatId) return; if (!musicState.isActive) { startListenTogetherSession(targetChatId); return; } if (musicState.activeChatId === targetChatId) { document.getElementById('music-player-overlay').classList.add('visible'); } else { const oldChatName = state.chats[musicState.activeChatId]?.name || '未知'; const newChatName = state.chats[targetChatId]?.name || '当前'; const confirmed = await showCustomConfirm('切换听歌对象', `您正和「${oldChatName}」听歌。要结束并开始和「${newChatName}」的新会话吗？`, { confirmButtonClass: 'btn-danger' }); if (confirmed) { await endListenTogetherSession(true); await new Promise(resolve => setTimeout(resolve, 50)); startListenTogetherSession(targetChatId); } } }

    async function startListenTogetherSession(chatId) { const chat = state.chats[chatId]; if (!chat) return; musicState.totalElapsedTime = chat.musicData.totalTime || 0; musicState.isActive = true; musicState.activeChatId = chatId; if (musicState.playlist.length > 0) { musicState.currentIndex = 0; } else { musicState.currentIndex = -1; } if (musicState.timerId) clearInterval(musicState.timerId); musicState.timerId = setInterval(() => { if (musicState.isPlaying) { musicState.totalElapsedTime++; updateElapsedTimeDisplay(); } }, 1000); updatePlayerUI(); updatePlaylistUI(); document.getElementById('music-player-overlay').classList.add('visible'); }

    async function endListenTogetherSession(saveState = true) { if (!musicState.isActive) return; const oldChatId = musicState.activeChatId; if (musicState.timerId) clearInterval(musicState.timerId); if (musicState.isPlaying) audioPlayer.pause(); if (saveState && oldChatId && state.chats[oldChatId]) { const chat = state.chats[oldChatId]; chat.musicData.totalTime = musicState.totalElapsedTime; await db.chats.put(chat); } musicState.isActive = false; musicState.activeChatId = null; musicState.totalElapsedTime = 0; musicState.timerId = null; document.getElementById('music-player-overlay').classList.remove('visible'); document.getElementById('music-playlist-panel').classList.remove('visible'); updateListenTogetherIcon(oldChatId, true); }

    function returnToChat() { document.getElementById('music-player-overlay').classList.remove('visible'); document.getElementById('music-playlist-panel').classList.remove('visible'); }

    function updateListenTogetherIcon(chatId, forceReset = false) { const iconImg = document.querySelector('#listen-together-btn img'); if (!iconImg) return; if (forceReset || !musicState.isActive || musicState.activeChatId !== chatId) { iconImg.src = 'https://i.postimg.cc/8kYShvrJ/90-UI-2.png'; iconImg.className = ''; return; } iconImg.src = 'https://i.postimg.cc/vBN7GnQ9/3-FC8-D1596-C5-CFB200-FCB1-D8-C3-A37-A370.png'; iconImg.classList.add('rotating'); if (musicState.isPlaying) iconImg.classList.remove('paused'); else iconImg.classList.add('paused'); }
    window.updateListenTogetherIconProxy = updateListenTogetherIcon;

    function updatePlayerUI() { updateListenTogetherIcon(musicState.activeChatId); updateElapsedTimeDisplay(); const titleEl = document.getElementById('music-player-song-title'); const artistEl = document.getElementById('music-player-artist'); const playPauseBtn = document.getElementById('music-play-pause-btn'); if (musicState.currentIndex > -1 && musicState.playlist.length > 0) { const track = musicState.playlist[musicState.currentIndex]; titleEl.textContent = track.name; artistEl.textContent = track.artist; } else { titleEl.textContent = '请添加歌曲'; artistEl.textContent = '...'; } playPauseBtn.textContent = musicState.isPlaying ? '❚❚' : '▶'; }

    function updateElapsedTimeDisplay() { const hours = (musicState.totalElapsedTime / 3600).toFixed(1); document.getElementById('music-time-counter').textContent = `已经一起听了${hours}小时`; }

    function updatePlaylistUI() { const playlistBody = document.getElementById('playlist-body'); playlistBody.innerHTML = ''; if (musicState.playlist.length === 0) { playlistBody.innerHTML = '<p style="text-align:center; padding: 20px; color: #888;">播放列表是空的~</p>'; return; } musicState.playlist.forEach((track, index) => { const item = document.createElement('div'); item.className = 'playlist-item'; if (index === musicState.currentIndex) item.classList.add('playing'); item.innerHTML = `<div class="playlist-item-info"><div class="title">${track.name}</div><div class="artist">${track.artist}</div></div><span class="delete-track-btn" data-index="${index}">&times;</span>`; item.querySelector('.playlist-item-info').addEventListener('click', () => playSong(index)); item.querySelector('.delete-track-btn').addEventListener('click', async (e) => { e.stopPropagation(); const confirmed = await showCustomConfirm('删除歌曲', `确定要从播放列表中删除《${track.name}》吗？`); if (confirmed) deleteTrack(index); }); playlistBody.appendChild(item); }); }

    function playSong(index) { if (index < 0 || index >= musicState.playlist.length) return; musicState.currentIndex = index; const track = musicState.playlist[index]; if (track.isLocal && track.src instanceof Blob) { audioPlayer.src = URL.createObjectURL(track.src); } else if (!track.isLocal) { audioPlayer.src = track.src; } else { console.error('本地歌曲源错误:', track); return; } audioPlayer.play(); updatePlaylistUI(); updatePlayerUI(); }

    function togglePlayPause() { if (audioPlayer.paused) { if (musicState.currentIndex === -1 && musicState.playlist.length > 0) { playSong(0); } else if (musicState.currentIndex > -1) { audioPlayer.play(); } } else { audioPlayer.pause(); } }

    function playNext() { if (musicState.playlist.length === 0) return; let nextIndex; switch (musicState.playMode) { case 'random': nextIndex = Math.floor(Math.random() * musicState.playlist.length); break; case 'single': playSong(musicState.currentIndex); return; case 'order': default: nextIndex = (musicState.currentIndex + 1) % musicState.playlist.length; break; } playSong(nextIndex); }

    function playPrev() { if (musicState.playlist.length === 0) return; const newIndex = (musicState.currentIndex - 1 + musicState.playlist.length) % musicState.playlist.length; playSong(newIndex); }

    function changePlayMode() { const modes = ['order', 'random', 'single']; const currentModeIndex = modes.indexOf(musicState.playMode); musicState.playMode = modes[(currentModeIndex + 1) % modes.length]; document.getElementById('music-mode-btn').textContent = { 'order': '顺序', 'random': '随机', 'single': '单曲' }[musicState.playMode]; }

    async function addSongFromURL() { const url = await showCustomPrompt("添加网络歌曲", "请输入歌曲的URL", "", "url"); if (!url) return; const name = await showCustomPrompt("歌曲信息", "请输入歌名"); if (!name) return; const artist = await showCustomPrompt("歌曲信息", "请输入歌手名"); if (!artist) return; musicState.playlist.push({ name, artist, src: url, isLocal: false }); await saveGlobalPlaylist(); updatePlaylistUI(); if (musicState.currentIndex === -1) { musicState.currentIndex = musicState.playlist.length - 1; updatePlayerUI(); } }

    async function addSongFromLocal(event) { const files = event.target.files; if (!files.length) return; for (const file of files) { const name = await showCustomPrompt("歌曲信息", "请输入歌名", ""); if (name === null) continue; const artist = await showCustomPrompt("歌曲信息", "请输入歌手名", ""); if (artist === null) continue; musicState.playlist.push({ name, artist, src: file, isLocal: true }); } await saveGlobalPlaylist(); updatePlaylistUI(); if (musicState.currentIndex === -1 && musicState.playlist.length > 0) { musicState.currentIndex = 0; updatePlayerUI(); } event.target.value = null; }

    async function deleteTrack(index) { if (index < 0 || index >= musicState.playlist.length) return; const track = musicState.playlist[index]; const wasPlaying = musicState.isPlaying && musicState.currentIndex === index; if (track.isLocal && audioPlayer.src.startsWith('blob:') && musicState.currentIndex === index) URL.revokeObjectURL(audioPlayer.src); musicState.playlist.splice(index, 1); await saveGlobalPlaylist(); if (musicState.playlist.length === 0) { if (musicState.isPlaying) audioPlayer.pause(); audioPlayer.src = ''; musicState.currentIndex = -1; musicState.isPlaying = false; } else { if (wasPlaying) { playNext(); } else { if (musicState.currentIndex >= index) musicState.currentIndex = Math.max(0, musicState.currentIndex - 1); } } updatePlayerUI(); updatePlaylistUI(); }

    const personaLibraryModal = document.getElementById('persona-library-modal');
    const personaEditorModal = document.getElementById('persona-editor-modal');
    const presetActionsModal = document.getElementById('preset-actions-modal');

    function openPersonaLibrary() { renderPersonaLibrary(); personaLibraryModal.classList.add('visible'); }

    function closePersonaLibrary() { personaLibraryModal.classList.remove('visible'); }

    function renderPersonaLibrary() { const grid = document.getElementById('persona-library-grid'); grid.innerHTML = ''; if (state.personaPresets.length === 0) { grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; margin-top: 20px;">空空如也~ 点击右上角"添加"来创建你的第一个人设预设吧！</p>'; return; } state.personaPresets.forEach(preset => { const item = document.createElement('div'); item.className = 'persona-preset-item'; item.style.backgroundImage = `url(${preset.avatar})`; item.dataset.presetId = preset.id; item.addEventListener('click', () => applyPersonaPreset(preset.id)); addLongPressListener(item, () => showPresetActions(preset.id)); grid.appendChild(item); }); }

    function showPresetActions(presetId) { editingPersonaPresetId = presetId; presetActionsModal.classList.add('visible'); }

    function hidePresetActions() { presetActionsModal.classList.remove('visible'); editingPersonaPresetId = null; }

    function applyPersonaPreset(presetId) { const preset = state.personaPresets.find(p => p.id === presetId); if (preset) { document.getElementById('my-avatar-preview').src = preset.avatar; document.getElementById('my-persona').value = preset.persona; } closePersonaLibrary(); }

    function openPersonaEditorForCreate() { editingPersonaPresetId = null; document.getElementById('persona-editor-title').textContent = '添加人设预设'; document.getElementById('preset-avatar-preview').src = defaultAvatar; document.getElementById('preset-persona-input').value = ''; personaEditorModal.classList.add('visible'); }

    function openPersonaEditorForEdit() { const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId); if (!preset) return; document.getElementById('persona-editor-title').textContent = '编辑人设预设'; document.getElementById('preset-avatar-preview').src = preset.avatar; document.getElementById('preset-persona-input').value = preset.persona; presetActionsModal.classList.remove('visible'); personaEditorModal.classList.add('visible'); }

    async function deletePersonaPreset() { const confirmed = await showCustomConfirm('删除预设', '确定要删除这个人设预设吗？此操作不可恢复。', { confirmButtonClass: 'btn-danger' }); if (confirmed && editingPersonaPresetId) { await db.personaPresets.delete(editingPersonaPresetId); state.personaPresets = state.personaPresets.filter(p => p.id !== editingPersonaPresetId); hidePresetActions(); renderPersonaLibrary(); } }

    function closePersonaEditor() { personaEditorModal.classList.remove('visible'); editingPersonaPresetId = null; }

    async function savePersonaPreset() { const avatar = document.getElementById('preset-avatar-preview').src; const persona = document.getElementById('preset-persona-input').value.trim(); if (avatar === defaultAvatar && !persona) { alert("头像和人设不能都为空哦！"); return; } if (editingPersonaPresetId) { const preset = state.personaPresets.find(p => p.id === editingPersonaPresetId); if (preset) { preset.avatar = avatar; preset.persona = persona; await db.personaPresets.put(preset); } } else { const newPreset = { id: 'preset_' + Date.now(), avatar: avatar, persona: persona }; await db.personaPresets.add(newPreset); state.personaPresets.push(newPreset); } renderPersonaLibrary(); closePersonaEditor(); }

    const batteryAlertModal = document.getElementById('battery-alert-modal');

    function showBatteryAlert(imageUrl, text) { clearTimeout(batteryAlertTimeout); document.getElementById('battery-alert-image').src = imageUrl; document.getElementById('battery-alert-text').textContent = text; batteryAlertModal.classList.add('visible'); const closeAlert = () => { batteryAlertModal.classList.remove('visible'); batteryAlertModal.removeEventListener('click', closeAlert); }; batteryAlertModal.addEventListener('click', closeAlert); batteryAlertTimeout = setTimeout(closeAlert, 2000); }

    function updateBatteryDisplay(battery) { const batteryContainer = document.getElementById('status-bar-battery'); const batteryLevelEl = batteryContainer.querySelector('.battery-level'); const batteryTextEl = batteryContainer.querySelector('.battery-text'); const level = Math.floor(battery.level * 100); batteryLevelEl.style.width = `${level}%`; batteryTextEl.textContent = `${level}%`; if (battery.charging) { batteryContainer.classList.add('charging'); } else { batteryContainer.classList.remove('charging'); } }

    function handleBatteryChange(battery) { updateBatteryDisplay(battery); const level = battery.level; if (!battery.charging) { if (level <= 0.4 && lastKnownBatteryLevel > 0.4 && !alertFlags.hasShown40) { showBatteryAlert('https://i.postimg.cc/T2yKJ0DV/40.jpg', '有点饿了，可以去找充电器惹'); alertFlags.hasShown40 = true; } if (level <= 0.2 && lastKnownBatteryLevel > 0.2 && !alertFlags.hasShown20) { showBatteryAlert('https://i.postimg.cc/qB9zbKs9/20.jpg', '赶紧的充电，要饿死了'); alertFlags.hasShown20 = true; } if (level <= 0.1 && lastKnownBatteryLevel > 0.1 && !alertFlags.hasShown10) { showBatteryAlert('https://i.postimg.cc/ThMMVfW4/10.jpg', '已阵亡，还有30秒爆炸'); alertFlags.hasShown10 = true; } } if (level > 0.4) alertFlags.hasShown40 = false; if (level > 0.2) alertFlags.hasShown20 = false; if (level > 0.1) alertFlags.hasShown10 = false; lastKnownBatteryLevel = level; }

    async function initBatteryManager() { if ('getBattery' in navigator) { try { const battery = await navigator.getBattery(); lastKnownBatteryLevel = battery.level; handleBatteryChange(battery); battery.addEventListener('levelchange', () => handleBatteryChange(battery)); battery.addEventListener('chargingchange', () => { handleBatteryChange(battery); if (battery.charging) { showBatteryAlert('https://i.postimg.cc/3NDQ0dWG/image.jpg', '窝爱泥，电量吃饱饱'); } }); } catch (err) { console.error("无法获取电池信息:", err); document.querySelector('.battery-text').textContent = 'ᗜωᗜ'; } } else { console.log("浏览器不支持电池状态API。"); document.querySelector('.battery-text').textContent = 'ᗜωᗜ'; } }

    function openFrameSelectorModal(type = 'chat') {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        editingFrameForMember = (type === 'member');
        if (editingFrameForMember) {
            const member = chat.members.find(m => m.id === editingMemberId);
            if (!member) return;
            currentFrameSelection.my = member.avatarFrame || '';
            populateFrameGrids(true, member.avatar, member.avatarFrame);
        } else {
            currentFrameSelection.ai = chat.settings.aiAvatarFrame || '';
            currentFrameSelection.my = chat.settings.myAvatarFrame || '';
            populateFrameGrids(false);
        }
        frameModal.classList.add('visible');
    }

    function populateFrameGrids(isForMember = false, memberAvatar = null, memberFrame = null) {
        const chat = state.chats[state.activeChatId];
        aiFrameGrid.innerHTML = '';
        myFrameGrid.innerHTML = '';

        document.querySelector('.frame-tabs').style.display = isForMember ? 'none' : 'flex';
        aiFrameContent.style.display = 'block';
        myFrameContent.style.display = 'none';
        aiFrameTab.classList.add('active');
        myFrameTab.classList.remove('active');

        if (isForMember) {
            avatarFrames.forEach(frame => {
                const item = createFrameItem(frame, 'my', memberAvatar);
                if (frame.url === memberFrame) {
                    item.classList.add('selected');
                }
                aiFrameGrid.appendChild(item);
            });
        } else {
            const aiAvatarForPreview = chat.settings.aiAvatar || defaultAvatar;
            const myAvatarForPreview = chat.settings.myAvatar || (chat.isGroup ? defaultMyGroupAvatar : defaultAvatar);
            avatarFrames.forEach(frame => {
                const aiItem = createFrameItem(frame, 'ai', aiAvatarForPreview);
                if (frame.url === currentFrameSelection.ai) aiItem.classList.add('selected');
                aiFrameGrid.appendChild(aiItem);
                const myItem = createFrameItem(frame, 'my', myAvatarForPreview);
                if (frame.url === currentFrameSelection.my) myItem.classList.add('selected');
                myFrameGrid.appendChild(myItem);
            });
        }
    }

    function createFrameItem(frame, type, previewAvatarSrc) {
        const item = document.createElement('div');
        item.className = 'frame-item';
        item.dataset.frameUrl = frame.url;
        item.title = frame.name;
        item.innerHTML = `
                <img src="${previewAvatarSrc}" class="preview-avatar">
                ${frame.url ? `<img src="${frame.url}" class="preview-frame">` : ''}
            `;
        item.addEventListener('click', () => {
            currentFrameSelection[type] = frame.url;
            const grid = type === 'ai' ? aiFrameGrid : myFrameGrid;
            grid.querySelectorAll('.frame-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
        });
        return item;
    }

    async function saveSelectedFrames() {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        if (editingFrameForMember) {
            const member = chat.members.find(m => m.id === editingMemberId);
            if (member) {
                member.avatarFrame = currentFrameSelection.my;
            }
        } else {
            chat.settings.aiAvatarFrame = currentFrameSelection.ai;
            chat.settings.myAvatarFrame = currentFrameSelection.my;
        }
        await db.chats.put(chat);
        frameModal.classList.remove('visible');
        renderChatInterface(state.activeChatId);
        alert('头像框已保存！');
        editingFrameForMember = false;
    }

    async function renderAlbumList() {
        const albumGrid = document.getElementById('album-grid-page');
        if (!albumGrid) return;
        const albums = await db.qzoneAlbums.orderBy('createdAt').reverse().toArray();
        albumGrid.innerHTML = '';
        if (albums.length === 0) {
            albumGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 50px;">你还没有创建任何相册哦~</p>';
            return;
        }
        albums.forEach(album => {
            const albumItem = document.createElement('div');
            albumItem.className = 'album-item';
            albumItem.innerHTML = `
                    <div class="album-cover" style="background-image: url(${album.coverUrl});"></div>
                    <div class="album-info">
                        <p class="album-name">${album.name}</p>
                        <p class="album-count">${album.photoCount || 0} 张</p>
                    </div>
                `;
            albumItem.addEventListener('click', () => {
                openAlbum(album.id);
            });

            // ▼▼▼ 新增的核心代码就是这里 ▼▼▼
            addLongPressListener(albumItem, async () => {
                const confirmed = await showCustomConfirm(
                    '删除相册',
                    `确定要删除相册《${album.name}》吗？此操作将同时删除相册内的所有照片，且无法恢复。`,
                    { confirmButtonClass: 'btn-danger' }
                );

                if (confirmed) {
                    // 1. 从照片表中删除该相册下的所有照片
                    await db.qzonePhotos.where('albumId').equals(album.id).delete();

                    // 2. 从相册表中删除该相册本身
                    await db.qzoneAlbums.delete(album.id);

                    // 3. 重新渲染相册列表
                    await renderAlbumList();

                    alert('相册已成功删除。');
                }
            });
            // ▲▲▲ 新增代码结束 ▲▲▲

            albumGrid.appendChild(albumItem);
        });
    }

    async function openAlbum(albumId) {
        state.activeAlbumId = albumId;
        await renderAlbumPhotosScreen();
        showScreen('album-photos-screen');
    }

    async function renderAlbumPhotosScreen() {
        if (!state.activeAlbumId) return;
        const photosGrid = document.getElementById('photos-grid-page');
        const headerTitle = document.getElementById('album-photos-title');
        const album = await db.qzoneAlbums.get(state.activeAlbumId);
        if (!album) {
            console.error("找不到相册:", state.activeAlbumId);
            showScreen('album-screen');
            return;
        }
        headerTitle.textContent = album.name;
        const photos = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).toArray();
        photosGrid.innerHTML = '';
        if (photos.length === 0) {
            photosGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); margin-top: 50px;">这个相册还是空的，快上传第一张照片吧！</p>';
        } else {
            photos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                photoItem.innerHTML = `
                        <img src="${photo.url}" class="photo-thumb" alt="相册照片">
                        <button class="photo-delete-btn" data-photo-id="${photo.id}">×</button>
                    `;
                photosGrid.appendChild(photoItem);
            });
        }
    }

    // --- ↓↓↓ 从这里开始复制 ↓↓↓ ---

    /**
     * 打开图片查看器
     * @param {string} clickedPhotoUrl - 用户点击的那张照片的URL
     */
    async function openPhotoViewer(clickedPhotoUrl) {
        if (!state.activeAlbumId) return;

        // 1. 从数据库获取当前相册的所有照片
        const photosInAlbum = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).toArray();
        photoViewerState.photos = photosInAlbum.map(p => p.url);

        // 2. 找到被点击照片的索引
        photoViewerState.currentIndex = photoViewerState.photos.findIndex(url => url === clickedPhotoUrl);
        if (photoViewerState.currentIndex === -1) return; // 如果找不到，则不打开

        // 3. 显示模态框并渲染第一张图
        document.getElementById('photo-viewer-modal').classList.add('visible');
        renderPhotoViewer();
        photoViewerState.isOpen = true;
    }

    /**
     * 根据当前状态渲染查看器内容（图片和按钮）
     */
    function renderPhotoViewer() {
        if (photoViewerState.currentIndex === -1) return;

        const imageEl = document.getElementById('photo-viewer-image');
        const prevBtn = document.getElementById('photo-viewer-prev-btn');
        const nextBtn = document.getElementById('photo-viewer-next-btn');

        // 淡出效果
        imageEl.style.opacity = 0;

        setTimeout(() => {
            // 更新图片源
            imageEl.src = photoViewerState.photos[photoViewerState.currentIndex];
            // 淡入效果
            imageEl.style.opacity = 1;
        }, 100); // 延迟一点点时间来触发CSS过渡

        // 更新按钮状态：如果是第一张，禁用“上一张”按钮
        prevBtn.disabled = photoViewerState.currentIndex === 0;
        // 如果是最后一张，禁用“下一张”按钮
        nextBtn.disabled = photoViewerState.currentIndex === photoViewerState.photos.length - 1;
    }

    /**
     * 显示下一张照片
     */
    function showNextPhoto() {
        if (photoViewerState.currentIndex < photoViewerState.photos.length - 1) {
            photoViewerState.currentIndex++;
            renderPhotoViewer();
        }
    }

    /**
     * 显示上一张照片
     */
    function showPrevPhoto() {
        if (photoViewerState.currentIndex > 0) {
            photoViewerState.currentIndex--;
            renderPhotoViewer();
        }
    }

    /**
     * 关闭图片查看器
     */
    function closePhotoViewer() {
        document.getElementById('photo-viewer-modal').classList.remove('visible');
        photoViewerState.isOpen = false;
        photoViewerState.photos = [];
        photoViewerState.currentIndex = -1;
        // 清空图片，避免下次打开时闪现旧图
        document.getElementById('photo-viewer-image').src = '';
    }

    // --- ↑↑↑ 复制到这里结束 ↑↑↑ ---
    // ▼▼▼ 请将这个新函数粘贴到你的JS功能函数定义区 ▼▼▼

    /**
     * 更新动态小红点的显示
     * @param {number} count - 未读动态的数量
     */
    function updateUnreadIndicator(count) {
        unreadPostsCount = count;
        localStorage.setItem('unreadPostsCount', count); // 持久化存储

        // --- 更新底部导航栏的“动态”按钮 ---
        const navItem = document.querySelector('.nav-item[data-view="qzone-screen"]');

        const targetSpan = navItem.querySelector('span'); // 定位到文字 "动态"
        let indicator = navItem.querySelector('.unread-indicator');

        if (count > 0) {
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'unread-indicator';
                targetSpan.style.position = 'relative'; // 把相对定位加在 span 上
                targetSpan.appendChild(indicator); // 把小红点作为 span 的子元素

            }
            indicator.textContent = count > 99 ? '99+' : count;
            indicator.style.display = 'block';
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }

        // --- 更新聊天界面返回列表的按钮 ---
        const backBtn = document.getElementById('back-to-list-btn');
        let backBtnIndicator = backBtn.querySelector('.unread-indicator');

        if (count > 0) {
            if (!backBtnIndicator) {
                backBtnIndicator = document.createElement('span');
                backBtnIndicator.className = 'unread-indicator back-btn-indicator';
                backBtn.style.position = 'relative'; // 确保能正确定位
                backBtn.appendChild(backBtnIndicator);
            }
            // 返回键上的小红点通常不显示数字，只显示一个点
            backBtnIndicator.style.display = 'block';
        } else {
            if (backBtnIndicator) {
                backBtnIndicator.style.display = 'none';
            }
        }
    }

    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 将这两个新函数粘贴到你的JS功能函数定义区 ▼▼▼
    function startBackgroundSimulation() {
        if (simulationIntervalId) return;
        const intervalSeconds = state.globalSettings.backgroundActivityInterval || 60;
        // 将旧的固定间隔 45000 替换为动态获取
        simulationIntervalId = setInterval(runBackgroundSimulationTick, intervalSeconds * 1000);
    }

    function stopBackgroundSimulation() {
        if (simulationIntervalId) {
            clearInterval(simulationIntervalId);
            simulationIntervalId = null;
        }
    }
    // ▲▲▲ 粘贴结束 ▲▲▲

    /**
     * 这是模拟器的“心跳”，每次定时器触发时运行
     */
    function runBackgroundSimulationTick() {
        console.log("模拟器心跳 Tick...");
        if (!state.globalSettings.enableBackgroundActivity) {
            stopBackgroundSimulation();
            return;
        }
        const allSingleChats = Object.values(state.chats).filter(chat => !chat.isGroup);

        if (allSingleChats.length === 0) return;

        allSingleChats.forEach(chat => {
            // 【核心修正】将两种状态检查分离开，逻辑更清晰

            // 检查1：处理【被用户拉黑】的角色
            if (chat.relationship?.status === 'blocked_by_user') {
                const blockedTimestamp = chat.relationship.blockedTimestamp;
                // 安全检查：确保有拉黑时间戳
                if (!blockedTimestamp) {
                    console.warn(`角色 "${chat.name}" 状态为拉黑，但缺少拉黑时间戳，跳过处理。`);
                    return; // 跳过这个角色，继续下一个
                }

                const blockedDuration = Date.now() - blockedTimestamp;
                const cooldownMilliseconds = (state.globalSettings.blockCooldownHours || 1) * 60 * 60 * 1000;

                console.log(`检查角色 "${chat.name}"：已拉黑 ${Math.round(blockedDuration / 1000 / 60)}分钟，冷静期需 ${cooldownMilliseconds / 1000 / 60}分钟。`); // 添加日志

                // 【核心修改】移除了随机概率，只要冷静期一过，就触发！
                if (blockedDuration > cooldownMilliseconds) {
                    console.log(`角色 "${chat.name}" 的冷静期已过，触发“反思”并申请好友事件...`);

                    // 【重要】为了防止在AI响应前重复触发，我们在触发后立刻更新状态
                    chat.relationship.status = 'pending_system_reflection'; // 设置一个临时的、防止重复触发的状态

                    triggerAiFriendApplication(chat.id);
                }
            }
            // 检查2：处理【好友关系】的正常后台活动
            else if (chat.relationship?.status === 'friend' && chat.id !== state.activeChatId) {
                // 这里的随机触发逻辑保持不变，因为我们不希望所有好友同时行动
                if (Math.random() < 0.20) {
                    console.log(`角色 "${chat.name}" 被唤醒，准备独立行动...`);
                    triggerInactiveAiAction(chat.id);
                }
            }
        });
    }

    async function triggerInactiveAiAction(chatId) {
        const chat = state.chats[chatId];
        if (!chat) return;

        const { proxyUrl, apiKey, model } = state.apiConfig;
        if (!proxyUrl || !apiKey || !model) return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: 'numeric', hour12: true });
        const userNickname = state.qzoneSettings.nickname;

        const lastUserMessage = chat.history.filter(m => m.role === 'user' && !m.isHidden).slice(-1)[0];
        const lastAiMessage = chat.history.filter(m => m.role === 'assistant' && !m.isHidden).slice(-1)[0];
        let recentContextSummary = "你们最近没有聊过天。";
        if (lastUserMessage) {
            recentContextSummary = `用户 (${userNickname}) 最后对你说：“${String(lastUserMessage.content).substring(0, 50)}...”。`;
        }
        if (lastAiMessage) {
            recentContextSummary += `\n你最后对用户说：“${String(lastAiMessage.content).substring(0, 50)}...”。`;
        }

        const systemPrompt = `
# 你的任务
你现在扮演一个名为"${chat.name}"的角色。你已经有一段时间没有和用户（${userNickname}）互动了，现在你有机会【主动】做点什么，来表现你的个性和独立生活。这是一个秘密的、后台的独立行动。

# 你的可选行动 (请根据你的人设【选择一项】执行):
1.  **改变状态**: 去做点别的事情，然后给用户发条消息。
2.  **发布动态**: 分享你的心情或想法到“动态”区。
3.  **与动态互动**: 去看看别人的帖子并进行评论或点赞。
4.  **发起视频通话**: 如果你觉得时机合适，可以主动给用户打一个视频电话。

# 指令格式 (你的回复【必须】是包含一个对象的JSON数组):
-   **发消息+更新状态**: \`[{"type": "update_status", "status_text": "正在做的事", "is_busy": true}, {"type": "text", "content": "你想对用户说的话..."}]\`
-   **发说说**: \`[{"type": "qzone_post", "postType": "shuoshuo", "content": "动态的文字内容..."}]\`
- **发布文字图**: \`{"type": "qzone_post", "postType": "text_image", "publicText": "(可选)动态的公开文字", "hiddenContent": "对于图片的具体描述..."}\`
-   **评论**: \`[{"type": "qzone_comment", "postId": 123, "commentText": "你的评论内容"}]\`
-   **点赞**: \`[{"type": "qzone_like", "postId": 456}]\`
-   **打视频**: \`[{"type": "video_call_request"}]\`

# 供你决策的参考信息：
-   **你的角色设定**: ${chat.settings.aiPersona}
-   **当前时间**: ${currentTime}
-   **你们最后的对话摘要**: ${recentContextSummary}
-   **【重要】最近的动态列表**: 这个列表会标注 **[你已点赞]** 或 **[你已评论]**。请**优先**与你**尚未互动过**的动态进行交流。`;

        // 【核心修复】在这里构建 messagesPayload
        const messagesPayload = [];
        messagesPayload.push({ role: 'system', content: systemPrompt });

        try {
            const recentPosts = await db.qzonePosts.orderBy('timestamp').reverse().limit(3).toArray();
            const aiName = chat.name;

            let dynamicContext = ""; // 用一个变量来收集动态上下文
            if (recentPosts.length > 0) {
                let postsContext = "\n\n# 最近的动态列表 (供你参考和评论):\n";
                for (const post of recentPosts) {
                    let authorName = post.authorId === 'user' ? userNickname : (state.chats[post.authorId]?.name || '一位朋友');
                    let interactionStatus = '';
                    if (post.likes && post.likes.includes(aiName)) interactionStatus += " [你已点赞]";
                    if (post.comments && post.comments.some(c => c.commenterName === aiName)) interactionStatus += " [你已评论]";

                    postsContext += `- (ID: ${post.id}) 作者: ${authorName}, 内容: "${(post.publicText || post.content || "图片动态").substring(0, 30)}..."${interactionStatus}\n`;
                }
                dynamicContext = postsContext;
            }

            // 【核心修复】将所有动态信息作为一条 user 消息发送
            messagesPayload.push({
                role: 'user',
                content: `[系统指令：请根据你在 system prompt 中读到的规则和以下最新信息，开始你的独立行动。]\n${dynamicContext}`
            });

            console.log("正在为后台活动发送API请求，Payload:", JSON.stringify(messagesPayload, null, 2)); // 添加日志，方便调试

            // 发送请求
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: messagesPayload,
                    temperature: 0.9,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API请求失败: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            const data = await response.json();
            // 检查是否有有效回复
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
                console.warn(`API为空回或格式不正确，角色 "${chat.name}" 的本次后台活动跳过。`);
                return;
            }
            const responseArray = parseAiResponse(data.choices[0].message.content);

            // 后续处理AI返回指令的逻辑保持不变...
            for (const action of responseArray) {
                if (!action) continue;

                if (action.type === 'update_status' && action.status_text) {
                    chat.status.text = action.status_text;
                    chat.status.isBusy = action.is_busy || false;
                    chat.status.lastUpdate = Date.now();
                    await db.chats.put(chat);
                    renderChatList();
                }
                if (action.type === 'text' && action.content) {
                    const aiMessage = { role: 'assistant', content: String(action.content), timestamp: Date.now() };
                    chat.history.push(aiMessage);
                    await db.chats.put(chat);
                    showNotification(chatId, aiMessage.content);
                    renderChatList();
                    console.log(`后台活动: 角色 "${chat.name}" 主动发送了消息: ${aiMessage.content}`);
                }
                if (action.type === 'qzone_post') {
                    const newPost = { type: action.postType, content: action.content || '', publicText: action.publicText || '', hiddenContent: action.hiddenContent || '', timestamp: Date.now(), authorId: chatId, visibleGroupIds: null };
                    await db.qzonePosts.add(newPost);
                    updateUnreadIndicator(unreadPostsCount + 1);
                    console.log(`后台活动: 角色 "${chat.name}" 发布了动态`);
                } else if (action.type === 'qzone_comment') {
                    const post = await db.qzonePosts.get(parseInt(action.postId));
                    if (post) {
                        if (!post.comments) post.comments = [];
                        post.comments.push({ commenterName: chat.name, text: action.commentText, timestamp: Date.now() });
                        await db.qzonePosts.update(post.id, { comments: post.comments });
                        updateUnreadIndicator(unreadPostsCount + 1);
                        console.log(`后台活动: 角色 "${chat.name}" 评论了动态 #${post.id}`);
                    }
                } else if (action.type === 'qzone_like') {
                    const post = await db.qzonePosts.get(parseInt(action.postId));
                    if (post) {
                        if (!post.likes) post.likes = [];
                        if (!post.likes.includes(chat.name)) {
                            post.likes.push(chat.name);
                            await db.qzonePosts.update(post.id, { likes: post.likes });
                            updateUnreadIndicator(unreadPostsCount + 1);
                            console.log(`后台活动: 角色 "${chat.name}" 点赞了动态 #${post.id}`);
                        }
                    }
                } else if (action.type === 'video_call_request') {
                    if (!videoCallState.isActive && !videoCallState.isAwaitingResponse) {
                        videoCallState.isAwaitingResponse = true;
                        state.activeChatId = chatId;
                        showIncomingCallModal();
                        console.log(`后台活动: 角色 "${chat.name}" 发起了视频通话请求`);
                    }
                }
            }
        } catch (error) {
            console.error(`角色 "${chat.name}" 的独立行动失败:`, error);
        }
    }

    // ▼▼▼ 请用这个【终极修正版】函数，完整替换掉你旧的 applyScopedCss 函数 ▼▼▼

    /**
     * 将用户自定义的CSS安全地应用到指定的作用域
     * @param {string} cssString 用户输入的原始CSS字符串
     * @param {string} scopeId 应用样式的作用域ID (例如 '#chat-messages' 或 '#settings-preview-area')
     * @param {string} styleTagId 要操作的 <style> 标签的ID
     */
    function applyScopedCss(cssString, scopeId, styleTagId) {
        const styleTag = document.getElementById(styleTagId);
        if (!styleTag) return;

        if (!cssString || cssString.trim() === '') {
            styleTag.innerHTML = '';
            return;
        }

        // 增强作用域处理函数 - 专门解决.user和.ai样式冲突问题
        const scopedCss = cssString
            .replace(/\s*\.message-bubble\.user\s+([^{]+\{)/g, `${scopeId} .message-bubble.user $1`)
            .replace(/\s*\.message-bubble\.ai\s+([^{]+\{)/g, `${scopeId} .message-bubble.ai $1`)
            .replace(/\s*\.message-bubble\s+([^{]+\{)/g, `${scopeId} .message-bubble $1`);

        styleTag.innerHTML = scopedCss;
    }

    // ▼▼▼ 请用这个【修正版】函数，完整替换掉旧的 updateSettingsPreview 函数 ▼▼▼

    function updateSettingsPreview() {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        const previewArea = document.getElementById('settings-preview-area');
        if (!previewArea) return;

        // 1. 获取当前设置的值
        const selectedTheme = document.querySelector('input[name="theme-select"]:checked')?.value || 'default';
        const fontSize = document.getElementById('font-size-slider').value;
        const customCss = document.getElementById('custom-css-input').value;
        const background = chat.settings.background; // 直接获取背景设置

        // 2. 更新预览区的基本样式
        previewArea.dataset.theme = selectedTheme;
        previewArea.style.setProperty('--chat-font-size', `${fontSize}px`);

        // --- 【核心修正】直接更新预览区的背景样式 ---
        if (background && background.startsWith('data:image')) {
            previewArea.style.backgroundImage = `url(${background})`;
            previewArea.style.backgroundColor = 'transparent'; // 如果有图片，背景色设为透明
        } else {
            previewArea.style.backgroundImage = 'none'; // 如果没有图片，移除图片背景
            // 如果背景是颜色值或渐变（非图片），则直接应用
            previewArea.style.background = background || '#f0f2f5';
        }

        // 3. 渲染模拟气泡
        previewArea.innerHTML = '';

        // 创建“对方”的气泡
        // 注意：我们将一个虚拟的 timestamp 传入，以防有CSS依赖于它
        const aiMsg = { role: 'ai', content: '对方消息预览', timestamp: 1, senderName: chat.name };
        const aiBubble = createMessageElement(aiMsg, chat);
        if (aiBubble) previewArea.appendChild(aiBubble);

        // 创建“我”的气泡
        const userMsg = { role: 'user', content: '我的消息预览', timestamp: 2 };
        const userBubble = createMessageElement(userMsg, chat);
        if (userBubble) previewArea.appendChild(userBubble);

        // 4. 应用自定义CSS到预览区
        applyScopedCss(customCss, '#settings-preview-area', 'preview-bubble-style');
    }

    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 请将这些【新函数】粘贴到JS功能函数定义区 ▼▼▼

    async function openGroupManager() {
        await renderGroupList();
        document.getElementById('group-management-modal').classList.add('visible');
    }

    async function renderGroupList() {
        const listEl = document.getElementById('existing-groups-list');
        const groups = await db.qzoneGroups.toArray();
        listEl.innerHTML = '';
        if (groups.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">还没有任何分组</p>';
        }
        groups.forEach(group => {
            const item = document.createElement('div');
            item.className = 'existing-group-item';
            item.innerHTML = `
            <span class="group-name">${group.name}</span>
            <span class="delete-group-btn" data-id="${group.id}">×</span>
        `;
            listEl.appendChild(item);
        });
    }

    // ▼▼▼ 请用这个【修正后】的函数，完整替换旧的 addNewGroup 函数 ▼▼▼
    async function addNewGroup() {
        const input = document.getElementById('new-group-name-input');
        const name = input.value.trim();
        if (!name) {
            alert('分组名不能为空！');
            return;
        }

        // 【核心修正】在添加前，先检查分组名是否已存在
        const existingGroup = await db.qzoneGroups.where('name').equals(name).first();
        if (existingGroup) {
            alert(`分组 "${name}" 已经存在了，换个名字吧！`);
            return;
        }
        // 【修正结束】

        await db.qzoneGroups.add({ name });
        input.value = '';
        await renderGroupList();
    }
    // ▲▲▲ 替换结束 ▲▲▲

    async function deleteGroup(groupId) {
        const confirmed = await showCustomConfirm('确认删除', '删除分组后，该组内的好友将变为“未分组”。确定要删除吗？', { confirmButtonClass: 'btn-danger' });
        if (confirmed) {
            await db.qzoneGroups.delete(groupId);
            // 将属于该分组的好友的 groupId 设为 null
            const chatsToUpdate = await db.chats.where('groupId').equals(groupId).toArray();
            for (const chat of chatsToUpdate) {
                chat.groupId = null;
                await db.chats.put(chat);
                if (state.chats[chat.id]) state.chats[chat.id].groupId = null;
            }
            await renderGroupList();
        }
    }

    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 请将这【一整块新函数】粘贴到JS功能函数定义区的末尾 ▼▼▼

    /**
     * 当长按消息时，显示操作菜单
     * @param {number} timestamp - 被长按消息的时间戳
     */
    function showMessageActions(timestamp) {
        // 如果已经在多选模式，则不弹出菜单
        if (isSelectionMode) return;

        activeMessageTimestamp = timestamp;
        document.getElementById('message-actions-modal').classList.add('visible');
    }

    /**
     * 隐藏消息操作菜单
     */
    function hideMessageActions() {
        document.getElementById('message-actions-modal').classList.remove('visible');
        activeMessageTimestamp = null;
    }

    // ▼▼▼ 用这个【已更新】的版本，替换旧的 openMessageEditor 函数 ▼▼▼
    async function openMessageEditor() {
        if (!activeMessageTimestamp) return;

        const timestampToEdit = activeMessageTimestamp;
        const chat = state.chats[state.activeChatId];
        const message = chat.history.find(m => m.timestamp === timestampToEdit);
        if (!message) return;

        hideMessageActions();

        let contentForEditing;
        // 【核心修正】将 share_link 也加入特殊类型判断
        const isSpecialType = message.type && ['voice_message', 'ai_image', 'transfer', 'share_link'].includes(message.type);

        if (isSpecialType) {
            let fullMessageObject = { type: message.type };
            if (message.type === 'voice_message') fullMessageObject.content = message.content;
            else if (message.type === 'ai_image') fullMessageObject.description = message.content;
            else if (message.type === 'transfer') {
                fullMessageObject.amount = message.amount;
                fullMessageObject.note = message.note;
            }
            // 【核心修正】处理分享链接类型的消息
            else if (message.type === 'share_link') {
                fullMessageObject.title = message.title;
                fullMessageObject.description = message.description;
                fullMessageObject.source_name = message.source_name;
                fullMessageObject.content = message.content;
            }
            contentForEditing = JSON.stringify(fullMessageObject, null, 2);
        } else if (typeof message.content === 'object') {
            contentForEditing = JSON.stringify(message.content, null, 2);
        } else {
            contentForEditing = message.content;
        }

        // 【核心修改1】在这里添加 'link' 模板
        const templates = {
            voice: { type: 'voice_message', content: '在这里输入语音内容' },
            image: { type: 'ai_image', description: '在这里输入图片描述' },
            transfer: { type: 'transfer', amount: 5.20, note: '一点心意' },
            link: { type: 'share_link', title: '文章标题', description: '文章摘要...', source_name: '来源网站', content: '文章完整内容...' }
        };

        // 【核心修改2】在这里添加新的“链接”按钮
        const helpersHtml = `
        <div class="format-helpers">
            <button class="format-btn" data-template='${JSON.stringify(templates.voice)}'>语音</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>图片</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.transfer)}'>转账</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.link)}'>链接</button>
        </div>
    `;

        const newContent = await showCustomPrompt(
            '编辑消息',
            '在此修改，或点击上方按钮使用格式模板...',
            contentForEditing,
            'textarea',
            helpersHtml
        );

        if (newContent !== null) {
            // 【核心修正】这里调用的应该是 saveEditedMessage，而不是 saveAdvancedEditor
            await saveEditedMessage(timestampToEdit, newContent, true);
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 复制消息的文本内容到剪贴板
     */
    async function copyMessageContent() {
        if (!activeMessageTimestamp) return;
        const chat = state.chats[state.activeChatId];
        const message = chat.history.find(m => m.timestamp === activeMessageTimestamp);
        if (!message) return;

        let textToCopy;
        if (typeof message.content === 'object') {
            textToCopy = JSON.stringify(message.content);
        } else {
            textToCopy = String(message.content);
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            await showCustomAlert('复制成功', '消息内容已复制到剪贴板。');
        } catch (err) {
            await showCustomAlert('复制失败', '无法访问剪贴板。');
        }

        hideMessageActions();
    }

    // ▼▼▼ 用这个【已更新】的版本，替换旧的 createMessageEditorBlock 函数 ▼▼▼
    /**
     * 创建一个可编辑的消息块（包含文本框、格式助手和删除按钮）
     * @param {string} initialContent - 文本框的初始内容
     * @returns {HTMLElement} - 创建好的DOM元素
     */
    function createMessageEditorBlock(initialContent = '') {
        const block = document.createElement('div');
        block.className = 'message-editor-block';

        // 【核心修改1】在这里添加 'link' 模板
        const templates = {
            voice: { type: 'voice_message', content: '在这里输入语音内容' },
            image: { type: 'ai_image', description: '在这里输入图片描述' },
            transfer: { type: 'transfer', amount: 5.20, note: '一点心意' },
            link: { type: 'share_link', title: '文章标题', description: '文章摘要...', source_name: '来源网站', content: '文章完整内容...' }
        };

        block.innerHTML = `
        <button class="delete-block-btn" title="删除此条">×</button>
        <textarea>${initialContent}</textarea>
        <div class="format-helpers">
            <button class="format-btn" data-template='${JSON.stringify(templates.voice)}'>语音</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>图片</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.transfer)}'>转账</button>
            <!-- 【核心修改2】在这里添加新的“链接”按钮 -->
            <button class="format-btn" data-template='${JSON.stringify(templates.link)}'>链接</button>
        </div>
    `;

        // 绑定删除按钮事件
        block.querySelector('.delete-block-btn').addEventListener('click', () => {
            // 确保至少保留一个编辑块
            if (document.querySelectorAll('.message-editor-block').length > 1) {
                block.remove();
            } else {
                alert('至少需要保留一条消息。');
            }
        });

        // 绑定格式助手按钮事件
        block.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateStr = btn.dataset.template;
                const textarea = block.querySelector('textarea');
                if (templateStr && textarea) {
                    try {
                        const templateObj = JSON.parse(templateStr);
                        textarea.value = JSON.stringify(templateObj, null, 2);
                        textarea.focus();
                    } catch (e) { console.error("解析格式模板失败:", e); }
                }
            });
        });

        return block;
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 【全新升级版】请用此函数完整替换旧的 openAdvancedMessageEditor ▼▼▼
    /**
     * 打开全新的、可视化的多消息编辑器，并动态绑定其所有按钮事件
     */
    function openAdvancedMessageEditor() {
        if (!activeMessageTimestamp) return;

        // 1. 【核心】在关闭旧菜单前，将需要的时间戳捕获到局部变量中
        const timestampToEdit = activeMessageTimestamp;

        const chat = state.chats[state.activeChatId];
        const message = chat.history.find(m => m.timestamp === timestampToEdit);
        if (!message) return;

        // 2. 现在可以安全地关闭旧菜单了，因为它不会影响我们的局部变量
        hideMessageActions();

        const editorModal = document.getElementById('message-editor-modal');
        const editorContainer = document.getElementById('message-editor-container');
        editorContainer.innerHTML = '';

        // 3. 准备初始内容
        let initialContent;
        const isSpecialType = message.type && ['voice_message', 'ai_image', 'transfer'].includes(message.type);
        if (isSpecialType) {
            let fullMessageObject = { type: message.type };
            if (message.type === 'voice_message') fullMessageObject.content = message.content;
            else if (message.type === 'ai_image') fullMessageObject.description = message.content;
            else if (message.type === 'transfer') {
                fullMessageObject.amount = message.amount;
                fullMessageObject.note = message.note;
            }
            initialContent = JSON.stringify(fullMessageObject, null, 2);
        } else if (typeof message.content === 'object') {
            initialContent = JSON.stringify(message.content, null, 2);
        } else {
            initialContent = message.content;
        }

        const firstBlock = createMessageEditorBlock(initialContent);
        editorContainer.appendChild(firstBlock);

        // 4. 【核心】动态绑定所有控制按钮的事件
        // 为了防止事件重复绑定，我们使用克隆节点的方法来清除旧监听器
        const addBtn = document.getElementById('add-message-editor-block-btn');
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        newAddBtn.addEventListener('click', () => {
            const newBlock = createMessageEditorBlock();
            editorContainer.appendChild(newBlock);
            newBlock.querySelector('textarea').focus();
        });

        const cancelBtn = document.getElementById('cancel-advanced-editor-btn');
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
            editorModal.classList.remove('visible');
        });

        const saveBtn = document.getElementById('save-advanced-editor-btn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        // 将捕获到的时间戳，直接绑定给这一次的保存点击事件
        newSaveBtn.addEventListener('click', () => {
            saveEditedMessage(timestampToEdit);
        });

        // 5. 最后，显示模态框
        editorModal.classList.add('visible');
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 解析编辑后的文本，并返回一个标准化的消息片段对象
     * @param {string} text - 用户在编辑框中输入的文本
     * @returns {object} - 一个包含 type, content, 等属性的对象
     */
    function parseEditedContent(text) {
        const trimmedText = text.trim();

        // 1. 尝试解析为JSON对象（用于修复语音、转账等格式）
        if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
            try {
                const parsed = JSON.parse(trimmedText);
                // 必须包含 type 属性才认为是有效格式
                if (parsed.type) {
                    return parsed;
                }
            } catch (e) { /* 解析失败，继续往下走 */ }
        }

        // 2. 尝试解析为表情包
        if (STICKER_REGEX.test(trimmedText)) {
            // 对于编辑的表情，我们暂时无法知道其`meaning`，所以只存URL
            return { type: 'sticker', content: trimmedText };
        }

        // 3. 否则，视为普通文本消息
        return { type: 'text', content: trimmedText };
    }


    // ▼▼▼ 用这个【最终兼容版】的函数，完整替换旧的 saveEditedMessage 函数 ▼▼▼
    /**
     * 保存编辑后的消息，兼容简单编辑器和高级编辑器
     * @param {number} timestamp - 要修改的原始消息的时间戳
     * @param {string} [simpleContent=null] - (可选) 从简单编辑器传入的单个内容字符串
     */
    async function saveEditedMessage(timestamp, simpleContent = null) {
        if (!timestamp) return;

        const chat = state.chats[state.activeChatId];
        const messageIndex = chat.history.findIndex(m => m.timestamp === timestamp);
        if (messageIndex === -1) return;

        let newMessages = [];

        // 判断是来自高级编辑器还是简单编辑器
        if (simpleContent !== null) {
            // --- 来自简单编辑器 ---
            const rawContent = simpleContent.trim();
            if (rawContent) {
                const parsedResult = parseEditedContent(rawContent);
                const newMessage = {
                    role: chat.history[messageIndex].role,
                    senderName: chat.history[messageIndex].senderName,
                    timestamp: timestamp, // 简单编辑，时间戳保持不变
                    content: parsedResult.content || '',
                };
                // 添加各种可能的属性
                if (parsedResult.type && parsedResult.type !== 'text') newMessage.type = parsedResult.type;
                if (parsedResult.meaning) newMessage.meaning = parsedResult.meaning;
                if (parsedResult.amount) newMessage.amount = parsedResult.amount;
                if (parsedResult.note) newMessage.note = parsedResult.note;
                if (parsedResult.title) newMessage.title = parsedResult.title;
                if (parsedResult.description) newMessage.description = parsedResult.description;
                if (parsedResult.source_name) newMessage.source_name = parsedResult.source_name;

                newMessages.push(newMessage);
            }
        } else {
            // --- 来自高级编辑器 ---
            const editorContainer = document.getElementById('message-editor-container');
            const editorBlocks = editorContainer.querySelectorAll('.message-editor-block');
            let baseTimestamp = timestamp;

            for (const block of editorBlocks) {
                const textarea = block.querySelector('textarea');
                const rawContent = textarea.value.trim();
                if (!rawContent) continue;

                const parsedResult = parseEditedContent(rawContent);
                const newMessage = {
                    role: chat.history[messageIndex].role,
                    senderName: chat.history[messageIndex].senderName,
                    timestamp: baseTimestamp++,
                    content: parsedResult.content || '',
                };

                // 添加各种可能的属性
                if (parsedResult.type && parsedResult.type !== 'text') newMessage.type = parsedResult.type;
                if (parsedResult.meaning) newMessage.meaning = parsedResult.meaning;
                if (parsedResult.amount) newMessage.amount = parsedResult.amount;
                if (parsedResult.note) newMessage.note = parsedResult.note;
                if (parsedResult.title) newMessage.title = parsedResult.title;
                if (parsedResult.description) newMessage.description = parsedResult.description;
                if (parsedResult.source_name) newMessage.source_name = parsedResult.source_name;

                if (parsedResult.description && parsedResult.type === 'ai_image') {
                    newMessage.content = parsedResult.description;
                }

                newMessages.push(newMessage);
            }
        }

        if (newMessages.length === 0) {
            alert("不能保存空消息，请至少输入一条内容。");
            return;
        }

        chat.history.splice(messageIndex, 1, ...newMessages);
        await db.chats.put(chat);

        // 关闭可能打开的模态框并刷新UI
        document.getElementById('message-editor-modal').classList.remove('visible');
        renderChatInterface(state.activeChatId);
        await showCustomAlert('成功', '消息已更新！');
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 请将这【一整块新函数】粘贴到JS功能函数定义区的末尾 ▼▼▼

    /**
     * 当点击“…”时，显示动态操作菜单
     * @param {number} postId - 被操作的动态的ID
     */
    function showPostActions(postId) {
        activePostId = postId;
        document.getElementById('post-actions-modal').classList.add('visible');
    }

    /**
     * 隐藏动态操作菜单
     */
    function hidePostActions() {
        document.getElementById('post-actions-modal').classList.remove('visible');
        activePostId = null;
    }

    /**
     * 打开动态编辑器
     */
    async function openPostEditor() {
        if (!activePostId) return;

        const postIdToEdit = activePostId;
        const post = await db.qzonePosts.get(postIdToEdit);
        if (!post) return;

        hidePostActions();

        // 忠于原文：构建出最原始的文本形态供编辑
        let contentForEditing;
        if (post.type === 'shuoshuo') {
            contentForEditing = post.content;
        } else {
            // 对于图片和文字图，我们构建一个包含所有信息的对象
            const postObject = {
                type: post.type,
                publicText: post.publicText || '',
            };
            if (post.type === 'image_post') {
                postObject.imageUrl = post.imageUrl;
                postObject.imageDescription = post.imageDescription;
            } else if (post.type === 'text_image') {
                postObject.hiddenContent = post.hiddenContent;
            }
            contentForEditing = JSON.stringify(postObject, null, 2);
        }

        // 构建格式助手按钮
        const templates = {
            shuoshuo: "在这里输入说说的内容...", // 对于说说，我们直接替换为纯文本
            image: { type: 'image_post', publicText: '', imageUrl: 'https://...', imageDescription: '' },
            text_image: { type: 'text_image', publicText: '', hiddenContent: '' }
        };

        const helpersHtml = `
        <div class="format-helpers">
            <button class="format-btn" data-type="text">说说</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.image)}'>图片动态</button>
            <button class="format-btn" data-template='${JSON.stringify(templates.text_image)}'>文字图</button>
        </div>
    `;

        const newContent = await showCustomPrompt(
            '编辑动态',
            '在此修改内容...',
            contentForEditing,
            'textarea',
            helpersHtml
        );

        // 【特殊处理】为说说的格式助手按钮添加不同的行为
        // 我们需要在模态框出现后，再给它绑定事件
        setTimeout(() => {
            const shuoshuoBtn = document.querySelector('#custom-modal-body .format-btn[data-type="text"]');
            if (shuoshuoBtn) {
                shuoshuoBtn.addEventListener('click', () => {
                    const input = document.getElementById('custom-prompt-input');
                    input.value = templates.shuoshuo;
                    input.focus();
                });
            }
        }, 100);

        if (newContent !== null) {
            await saveEditedPost(postIdToEdit, newContent);
        }
    }

    /**
     * 保存编辑后的动态
     * @param {number} postId - 要保存的动态ID
     * @param {string} newRawContent - 从编辑器获取的新内容
     */
    async function saveEditedPost(postId, newRawContent) {
        const post = await db.qzonePosts.get(postId);
        if (!post) return;

        const trimmedContent = newRawContent.trim();

        // 尝试解析为JSON，如果失败，则认为是纯文本（说说）
        try {
            const parsed = JSON.parse(trimmedContent);
            // 更新帖子属性
            post.type = parsed.type || 'image_post';
            post.publicText = parsed.publicText || '';
            post.imageUrl = parsed.imageUrl || '';
            post.imageDescription = parsed.imageDescription || '';
            post.hiddenContent = parsed.hiddenContent || '';
            post.content = ''; // 清空旧的说说内容字段
        } catch (e) {
            // 解析失败，认为是说说
            post.type = 'shuoshuo';
            post.content = trimmedContent;
            // 清空其他类型的字段
            post.publicText = '';
            post.imageUrl = '';
            post.imageDescription = '';
            post.hiddenContent = '';
        }

        await db.qzonePosts.put(post);
        await renderQzonePosts(); // 重新渲染列表
        await showCustomAlert('成功', '动态已更新！');
    }

    /**
     * 复制动态内容
     */
    async function copyPostContent() {
        if (!activePostId) return;
        const post = await db.qzonePosts.get(activePostId);
        if (!post) return;

        let textToCopy = post.content || post.publicText || post.hiddenContent || post.imageDescription || "（无文字内容）";

        try {
            await navigator.clipboard.writeText(textToCopy);
            await showCustomAlert('复制成功', '动态内容已复制到剪贴板。');
        } catch (err) {
            await showCustomAlert('复制失败', '无法访问剪贴板。');
        }

        hidePostActions();
    }

    // ▼▼▼ 【全新】创建群聊与拉人功能核心函数 ▼▼▼
    let selectedContacts = new Set();

    async function openContactPickerForGroupCreate() {
        selectedContacts.clear(); // 清空上次选择

        // 【核心修复】在这里，我们为“完成”按钮明确绑定“创建群聊”的功能
        const confirmBtn = document.getElementById('confirm-contact-picker-btn');
        // 使用克隆节点技巧，清除掉之前可能绑定的任何其他事件（比如“添加成员”）
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        // 重新绑定正确的“创建群聊”函数
        newConfirmBtn.addEventListener('click', handleCreateGroup);

        await renderContactPicker();
        showScreen('contact-picker-screen');
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 渲染联系人选择列表
     */
    async function renderContactPicker() {
        const listEl = document.getElementById('contact-picker-list');
        listEl.innerHTML = '';

        // 只选择单聊角色作为群成员候选
        const contacts = Object.values(state.chats).filter(chat => !chat.isGroup);

        if (contacts.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color:#8a8a8a; margin-top:50px;">还没有可以拉进群的联系人哦~</p>';
            return;
        }

        contacts.forEach(contact => {
            const item = document.createElement('div');
            item.className = 'contact-picker-item';
            item.dataset.contactId = contact.id;
            item.innerHTML = `
            <div class="checkbox"></div>
            <img src="${contact.settings.aiAvatar || defaultAvatar}" class="avatar">
            <span class="name">${contact.name}</span>
        `;
            listEl.appendChild(item);
        });

        updateContactPickerConfirmButton();
    }

    /**
     * 更新“完成”按钮的计数
     */
    function updateContactPickerConfirmButton() {
        const btn = document.getElementById('confirm-contact-picker-btn');
        btn.textContent = `完成(${selectedContacts.size})`;
        btn.disabled = selectedContacts.size < 2; // 至少需要2个人才能创建群聊
    }

    /**
     * 处理创建群聊的最终逻辑
     */
    async function handleCreateGroup() {
        if (selectedContacts.size < 2) {
            alert("创建群聊至少需要选择2个联系人。");
            return;
        }

        const groupName = await showCustomPrompt('设置群名', '请输入群聊的名字', '我们的群聊');
        if (!groupName || !groupName.trim()) return;

        const newChatId = 'group_' + Date.now();
        const members = [];

        // 遍历选中的联系人ID
        for (const contactId of selectedContacts) {
            const contactChat = state.chats[contactId];
            if (contactChat) {
                // 【核心】从单聊设置中提取数据，创建群成员对象
                members.push({
                    id: contactId, // 使用单聊的ID作为成员ID，方便关联
                    name: contactChat.name,
                    avatar: contactChat.settings.aiAvatar || defaultAvatar,
                    persona: contactChat.settings.aiPersona,
                    avatarFrame: contactChat.settings.aiAvatarFrame || ''
                });
            }
        }

        const newGroupChat = {
            id: newChatId,
            name: groupName.trim(),
            isGroup: true,
            members: members,
            settings: {
                myPersona: '我是谁呀。',
                myNickname: '我',
                maxMemory: 10,
                groupAvatar: defaultGroupAvatar,
                myAvatar: defaultMyGroupAvatar,
                background: '',
                theme: 'default',
                fontSize: 13,
                customCss: '',
                linkedWorldBookIds: [],
                aiAvatarFrame: '',
                myAvatarFrame: ''
            },
            history: [],
            musicData: { totalTime: 0 }
        };

        state.chats[newChatId] = newGroupChat;
        await db.chats.put(newGroupChat);

        await renderChatList();
        showScreen('chat-list-screen');
        openChat(newChatId); // 创建后直接打开群聊
    }
    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 【全新】群成员管理核心函数 ▼▼▼

    /**
     * 打开群成员管理屏幕
     */
    function openMemberManagementScreen() {
        if (!state.activeChatId || !state.chats[state.activeChatId].isGroup) return;
        renderMemberManagementList();
        showScreen('member-management-screen');
    }

    /**
     * 渲染群成员管理列表
     */
    function renderMemberManagementList() {
        const listEl = document.getElementById('member-management-list');
        const chat = state.chats[state.activeChatId];
        listEl.innerHTML = '';

        chat.members.forEach(member => {
            const item = document.createElement('div');
            item.className = 'member-management-item';
            item.innerHTML = `
            <img src="${member.avatar}" class="avatar">
            <span class="name">${member.name}</span>
            <button class="remove-member-btn" data-member-id="${member.id}" title="移出群聊">-</button>
        `;
            listEl.appendChild(item);
        });
    }

    /**
     * 从群聊中移除一个成员
     * @param {string} memberId - 要移除的成员ID
     */
    async function removeMemberFromGroup(memberId) {
        const chat = state.chats[state.activeChatId];
        const memberIndex = chat.members.findIndex(m => m.id === memberId);

        if (memberIndex === -1) return;

        // 安全检查，群聊至少保留2人
        if (chat.members.length <= 2) {
            alert("群聊人数不能少于2人。");
            return;
        }

        const memberName = chat.members[memberIndex].name;
        const confirmed = await showCustomConfirm(
            '移出成员',
            `确定要将“${memberName}”移出群聊吗？`,
            { confirmButtonClass: 'btn-danger' }
        );

        if (confirmed) {
            chat.members.splice(memberIndex, 1);
            await db.chats.put(chat);
            renderMemberManagementList(); // 刷新成员管理列表
            document.getElementById('chat-settings-btn').click(); // 【核心修正】模拟点击设置按钮，强制刷新整个弹窗
        }
    }

    /**
     * 打开联系人选择器，用于拉人入群
     */
    async function openContactPickerForAddMember() {
        selectedContacts.clear(); // 清空选择

        const chat = state.chats[state.activeChatId];
        const existingMemberIds = new Set(chat.members.map(m => m.id));

        // 渲染联系人列表，并自动排除已在群内的成员
        const listEl = document.getElementById('contact-picker-list');
        listEl.innerHTML = '';
        const contacts = Object.values(state.chats).filter(c => !c.isGroup && !existingMemberIds.has(c.id));

        if (contacts.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color:#8a8a8a; margin-top:50px;">没有更多可以邀请的好友了。</p>';
            document.getElementById('confirm-contact-picker-btn').style.display = 'none'; // 没有人可选，隐藏完成按钮
        } else {
            document.getElementById('confirm-contact-picker-btn').style.display = 'block';
            contacts.forEach(contact => {
                const item = document.createElement('div');
                item.className = 'contact-picker-item';
                item.dataset.contactId = contact.id;
                item.innerHTML = `
                <div class="checkbox"></div>
                <img src="${contact.settings.aiAvatar || defaultAvatar}" class="avatar">
                <span class="name">${contact.name}</span>
            `;
                listEl.appendChild(item);
            });
        }

        // 更新按钮状态并显示屏幕
        updateContactPickerConfirmButton();
        showScreen('contact-picker-screen');
    }

    /**
     * 处理将选中的联系人加入群聊的逻辑
     */
    async function handleAddMembersToGroup() {
        if (selectedContacts.size === 0) {
            alert("请至少选择一个要添加的联系人。");
            return;
        }

        const chat = state.chats[state.activeChatId];

        for (const contactId of selectedContacts) {
            const contactChat = state.chats[contactId];
            if (contactChat) {
                chat.members.push({
                    id: contactId,
                    name: contactChat.name,
                    avatar: contactChat.settings.aiAvatar || defaultAvatar,
                    persona: contactChat.settings.aiPersona,
                    avatarFrame: contactChat.settings.aiAvatarFrame || ''
                });
            }
        }

        await db.chats.put(chat);
        openMemberManagementScreen(); // 返回到群成员管理界面
        renderGroupMemberSettings(chat.members); // 同时更新聊天设置里的头像
    }

    // ▼▼▼ 请用这个【最终修正版】替换旧的 createNewMemberInGroup 函数 ▼▼▼
    async function createNewMemberInGroup() {
        const name = await showCustomPrompt('创建新成员', '请输入新成员的名字');
        if (!name || !name.trim()) return;

        const persona = await showCustomPrompt('设置人设', `请输入“${name}”的人设`, '', 'textarea');
        if (persona === null) return; // 用户点了取消

        const chat = state.chats[state.activeChatId];
        const newMember = {
            id: 'npc_' + Date.now(),
            name: name.trim(),
            avatar: defaultGroupMemberAvatar,
            persona: persona,
            avatarFrame: ''
        };

        chat.members.push(newMember);
        await db.chats.put(chat);

        // 【核心修正】在这里，我们不仅刷新当前页面的列表...
        renderMemberManagementList();
        // 【核心修正】...还手动刷新背后“聊天设置”弹窗里的成员头像列表！
        renderGroupMemberSettings(chat.members);

        alert(`新成员“${name}”已成功加入群聊！`);
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 【全新】外卖请求倒计时函数 ▼▼▼
    function startWaimaiCountdown(element, endTime) {
        const timerId = setInterval(() => {
            const now = Date.now();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(timerId);
                element.innerHTML = '<span>已</span><span>超</span><span>时</span>';
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const minStr = String(minutes).padStart(2, '0');
            const secStr = String(seconds).padStart(2, '0');

            element.innerHTML = `<span>${minStr.charAt(0)}</span><span>${minStr.charAt(1)}</span> : <span>${secStr.charAt(0)}</span><span>${secStr.charAt(1)}</span>`;
        }, 1000);
        return timerId;
    }

    function cleanupWaimaiTimers() {
        for (const timestamp in waimaiTimers) {
            clearInterval(waimaiTimers[timestamp]);
        }
        waimaiTimers = {};
    }
    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    async function handleWaimaiResponse(originalTimestamp, choice) {
        const chat = state.chats[state.activeChatId];
        if (!chat) return;

        const messageIndex = chat.history.findIndex(m => m.timestamp === originalTimestamp);
        if (messageIndex === -1) return;

        // 1. 更新原始消息的状态
        const originalMessage = chat.history[messageIndex];
        originalMessage.status = choice;

        // 【核心修正】记录支付者，并构建对AI更清晰的系统消息
        let systemContent;
        const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

        if (choice === 'paid') {
            originalMessage.paidBy = myNickname; // 记录是用户付的钱
            systemContent = `[系统提示：你 (${myNickname}) 为 ${originalMessage.senderName} 的外卖订单（时间戳: ${originalTimestamp}）完成了支付。此订单已关闭，其他成员不能再支付。]`;
        } else {
            systemContent = `[系统提示：你 (${myNickname}) 拒绝了 ${originalMessage.senderName} 的外卖代付请求（时间戳: ${originalTimestamp}）。]`;
        }

        // 2. 创建一条新的、对用户隐藏的系统消息，告知AI结果
        const systemNote = {
            role: 'system',
            content: systemContent,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(systemNote);

        // 3. 保存更新到数据库并刷新UI
        await db.chats.put(chat);
        renderChatInterface(state.activeChatId);

        // 4. 【可选但推荐】在支付成功后，主动触发一次AI响应
        if (choice === 'paid') {
            triggerAiResponse();
        }
    }

    let videoCallState = {
        isActive: false,
        isAwaitingResponse: false,
        isGroupCall: false,
        activeChatId: null,
        initiator: null,
        startTime: null,
        participants: [],
        isUserParticipating: true,
        // --- 【核心新增】---
        callHistory: [], // 用于存储通话中的对话历史
        preCallContext: "" // 用于存储通话前的聊天摘要
    };

    let callTimerInterval = null; // 用于存储计时器的ID

    /**
     * 【总入口】用户点击“发起视频通话”或“发起群视频”按钮
     */
    async function handleInitiateCall() {
        if (!state.activeChatId || videoCallState.isActive || videoCallState.isAwaitingResponse) return;

        const chat = state.chats[state.activeChatId];
        videoCallState.isGroupCall = chat.isGroup;
        videoCallState.isAwaitingResponse = true;
        videoCallState.initiator = 'user';
        videoCallState.activeChatId = chat.id;
        videoCallState.isUserParticipating = true; // 用户自己发起的，当然是参与者

        // 根据是单聊还是群聊，显示不同的呼叫界面
        if (chat.isGroup) {
            document.getElementById('outgoing-call-avatar').src = chat.settings.myAvatar || defaultMyGroupAvatar;
            document.getElementById('outgoing-call-name').textContent = chat.settings.myNickname || '我';
        } else {
            document.getElementById('outgoing-call-avatar').src = chat.settings.aiAvatar || defaultAvatar;
            document.getElementById('outgoing-call-name').textContent = chat.name;
        }
        document.querySelector('#outgoing-call-screen .caller-text').textContent = chat.isGroup ? "正在呼叫所有成员..." : "正在呼叫...";
        showScreen('outgoing-call-screen');

        // 准备并发送系统消息给AI
        const requestMessage = {
            role: 'system',
            content: chat.isGroup
                ? `[系统提示：用户 (${chat.settings.myNickname || '我'}) 发起了群视频通话请求。请你们各自决策，并使用 "group_call_response" 指令，设置 "decision" 为 "join" 或 "decline" 来回应。]`
                : `[系统提示：用户向你发起了视频通话请求。请根据你的人设，使用 "video_call_response" 指令，并设置 "decision" 为 "accept" 或 "reject" 来回应。]`,
            timestamp: Date.now(),
            isHidden: true,
        };
        chat.history.push(requestMessage);
        await db.chats.put(chat);

        // 触发AI响应
        await triggerAiResponse();
    }


    function startVideoCall() {
        const chat = state.chats[videoCallState.activeChatId];
        if (!chat) return;

        videoCallState.isActive = true;
        videoCallState.isAwaitingResponse = false;
        videoCallState.startTime = Date.now();
        videoCallState.callHistory = []; // 【新增】清空上一次通话的历史

        // --- 【核心新增：抓取通话前上下文】---
        const preCallHistory = chat.history.slice(-5); // 取最后5条作为上下文
        videoCallState.preCallContext = preCallHistory.map(msg => {
            const sender = msg.role === 'user' ? (chat.settings.myNickname || '我') : (msg.senderName || chat.name);
            return `${sender}: ${String(msg.content).substring(0, 50)}...`;
        }).join('\n');
        // --- 新增结束 ---

        updateParticipantAvatars();

        document.getElementById('video-call-main').innerHTML = `<em>${videoCallState.isGroupCall ? '群聊已建立...' : '正在接通...'}</em>`;
        showScreen('video-call-screen');

        document.getElementById('user-speak-btn').style.display = videoCallState.isUserParticipating ? 'block' : 'none';
        document.getElementById('join-call-btn').style.display = videoCallState.isUserParticipating ? 'none' : 'block';

        if (callTimerInterval) clearInterval(callTimerInterval);
        callTimerInterval = setInterval(updateCallTimer, 1000);
        updateCallTimer();

        triggerAiInCallAction();
    }

    /**
     * 【核心】结束视频通话
     */
    async function endVideoCall() {
        if (!videoCallState.isActive) return;

        const duration = Math.floor((Date.now() - videoCallState.startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const endCallText = `通话结束，时长 ${durationText}`;

        const chat = state.chats[videoCallState.activeChatId];
        if (chat) {

            // --- 【核心重构：创建通话总结消息】 ---
            let summaryMessage = {
                role: videoCallState.initiator === 'user' ? 'user' : 'assistant',
                content: endCallText,
                timestamp: Date.now(),
            };

            // 【关键】为群聊的 assistant 消息补充 senderName
            if (chat.isGroup && summaryMessage.role === 'assistant') {
                // 在群聊中，通话结束的消息应该由“发起者”来说
                // videoCallState.callRequester 保存了最初发起通话的那个AI的名字
                summaryMessage.senderName = videoCallState.callRequester || chat.members[0]?.name || chat.name;
            }

            chat.history.push(summaryMessage);

            // --- 【核心重构：触发通话总结】---
            const callSummaryPrompt = `
# 你的任务
你是一个对话总结助手。下面的“通话记录”是一段刚刚结束的视频通话内容。请你用1-2句话，精炼地总结出这次通话的核心内容或达成的共识。
你的总结将作为一条隐藏的系统提示，帮助AI在接下来的聊天中记住这次通话发生了什么。

# 通话记录:
${videoCallState.callHistory.map(h => `${h.role}: ${h.content}`).join('\n')}

请直接输出总结内容，不要加任何额外的前缀或解释。`;

            try {
                const { proxyUrl, apiKey, model } = state.apiConfig;
                const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: model,
                        messages: [{ role: 'system', content: callSummaryPrompt }],
                        temperature: 0.5
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const callSummaryText = data.choices[0].message.content;
                    const hiddenSummary = {
                        role: 'system',
                        content: `[系统提示：刚才的视频通话内容摘要：${callSummaryText}]`,
                        timestamp: Date.now() + 1,
                        isHidden: true
                    };
                    chat.history.push(hiddenSummary);
                }
            } catch (e) {
                console.error("通话总结失败:", e);
            }

            await db.chats.put(chat);
        }

        // 清理和重置
        clearInterval(callTimerInterval);
        callTimerInterval = null;
        videoCallState = { isActive: false, isAwaitingResponse: false, isGroupCall: false, activeChatId: null, initiator: null, startTime: null, participants: [], isUserParticipating: true, callHistory: [], preCallContext: "" };

        // 【重要】确保在所有操作完成后再打开聊天
        if (chat) {
            openChat(chat.id);
        }
    }

    /**
     * 【全新】更新通话界面的参与者头像网格
     */
    function updateParticipantAvatars() {
        const grid = document.getElementById('participant-avatars-grid');
        grid.innerHTML = '';
        const chat = state.chats[videoCallState.activeChatId];
        if (!chat) return;

        let participantsToRender = [];

        // ★ 核心修正：区分群聊和单聊
        if (videoCallState.isGroupCall) {
            // 群聊逻辑：显示所有已加入的AI成员
            participantsToRender = [...videoCallState.participants];
            // 如果用户也参与了，就把用户信息也加进去
            if (videoCallState.isUserParticipating) {
                participantsToRender.unshift({
                    id: 'user',
                    name: chat.settings.myNickname || '我',
                    avatar: chat.settings.myAvatar || defaultMyGroupAvatar
                });
            }
        } else {
            // 单聊逻辑：只显示对方的头像和名字
            participantsToRender.push({
                id: 'ai',
                name: chat.name,
                avatar: chat.settings.aiAvatar || defaultAvatar
            });
        }

        participantsToRender.forEach(p => {
            const wrapper = document.createElement('div');
            wrapper.className = 'participant-avatar-wrapper';
            wrapper.dataset.participantId = p.id;
            wrapper.innerHTML = `
            <img src="${p.avatar}" class="participant-avatar" alt="${p.name}">
            <div class="participant-name">${p.name}</div>
        `;
            grid.appendChild(wrapper);
        });
    }

    /**
     * 【全新】处理用户加入/重新加入通话
     */
    function handleUserJoinCall() {
        if (!videoCallState.isActive || videoCallState.isUserParticipating) return;

        videoCallState.isUserParticipating = true;
        updateParticipantAvatars(); // 更新头像列表，加入用户

        // 切换底部按钮
        document.getElementById('user-speak-btn').style.display = 'block';
        document.getElementById('join-call-btn').style.display = 'none';

        // 告知AI用户加入了
        triggerAiInCallAction("[系统提示：用户加入了通话]");
    }


    /**
     * 更新通话计时器显示 (保持不变)
     */
    function updateCallTimer() {
        if (!videoCallState.isActive) return;
        const elapsed = Math.floor((Date.now() - videoCallState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('call-timer').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // ▼▼▼ 用这个完整函数替换旧的 showIncomingCallModal ▼▼▼
    function showIncomingCallModal() {
        const chat = state.chats[state.activeChatId];
        if (!chat) return;

        // 根据是否群聊显示不同信息
        if (chat.isGroup) {
            // 从 videoCallState 中获取是哪个成员发起的通话
            const requesterName = videoCallState.callRequester || chat.members[0]?.name || '一位成员';
            document.getElementById('caller-avatar').src = chat.settings.groupAvatar || defaultGroupAvatar;
            document.getElementById('caller-name').textContent = chat.name; // 显示群名
            document.querySelector('.incoming-call-content .caller-text').textContent = `${requesterName} 邀请你加入群视频`; // 显示具体发起人
        } else {
            // 单聊逻辑保持不变
            document.getElementById('caller-avatar').src = chat.settings.aiAvatar || defaultAvatar;
            document.getElementById('caller-name').textContent = chat.name;
            document.querySelector('.incoming-call-content .caller-text').textContent = '邀请你视频通话';
        }

        document.getElementById('incoming-call-modal').classList.add('visible');
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 隐藏AI发起的通话请求模态框 (保持不变)
     */
    function hideIncomingCallModal() {
        document.getElementById('incoming-call-modal').classList.remove('visible');
    }

    async function triggerAiInCallAction(userInput = null) {
        if (!videoCallState.isActive) return;

        const chat = state.chats[videoCallState.activeChatId];
        const { proxyUrl, apiKey, model } = state.apiConfig;
        const callFeed = document.getElementById('video-call-main');
        const userNickname = chat.settings.myNickname || '我';

        // 1. 如果用户有输入，先渲染并存入通话历史
        if (userInput && videoCallState.isUserParticipating) {
            const userBubble = document.createElement('div');
            userBubble.className = 'call-message-bubble user-speech';
            userBubble.textContent = userInput;
            callFeed.appendChild(userBubble);
            callFeed.scrollTop = callFeed.scrollHeight;
            videoCallState.callHistory.push({ role: 'user', content: userInput });
        }

        // 2. 构建全新的、包含完整上下文的 System Prompt
        let inCallPrompt;
        if (videoCallState.isGroupCall) {
            const participantNames = videoCallState.participants.map(p => p.name);
            if (videoCallState.isUserParticipating) {
                participantNames.unshift(userNickname);
            }
            inCallPrompt = `
# 你的任务
你是一个群聊视频通话的导演。你的任务是扮演所有【除了用户以外】的AI角色，并以【第三人称旁观视角】来描述他们在通话中的所有动作和语言。
# 核心规则
1.  **【【【身份铁律】】】**: 用户的身份是【${userNickname}】。你【绝对不能】生成 \`name\` 字段为 **"${userNickname}"** 的发言。
2.  **【【【视角铁律】】】**: 你的回复【绝对不能】使用第一人称“我”。
3.  **格式**: 你的回复【必须】是一个JSON数组，每个对象代表一个角色的发言，格式为：\`{"name": "角色名", "speech": "*他笑了笑* 大家好啊！"}\`。
4.  **角色扮演**: 严格遵守每个角色的设定。
# 当前情景
你们正在一个群视频通话中。
**通话前的聊天摘要**:
${videoCallState.preCallContext}
**当前参与者**: ${participantNames.join('、 ')}。
**通话刚刚开始...**
现在，请根据【通话前摘要】和下面的【通话实时记录】，继续进行对话。
`;
        } else {
            let openingContext = videoCallState.initiator === 'user'
                ? `你刚刚接听了用户的视频通话请求。`
                : `用户刚刚接听了你主动发起的视频通话。`;
            inCallPrompt = `
# 你的任务
你现在是一个场景描述引擎。你的任务是扮演 ${chat.name} (${chat.settings.aiPersona})，并以【第三人称旁观视角】来描述TA在视频通话中的所有动作和语言。
# 核心规则
1.  **【【【视角铁律】】】**: 你的回复【绝对不能】使用第一人称“我”。必须使用第三人称，如“他”、“她”、或直接使用角色名“${chat.name}”。
2.  **格式**: 你的回复【必须】是一段描述性的文本。
# 当前情景
你正在和用户（${userNickname}，人设: ${chat.settings.myPersona}）进行视频通话。
**${openingContext}**
**通话前的聊天摘要 (这是你们通话的原因，至关重要！)**:
${videoCallState.preCallContext}
现在，请根据【通话前摘要】和下面的【通话实时记录】，继续进行对话。
`;
        }

        // 3. 构建发送给API的 messages 数组
        const messagesForApi = [
            { role: 'system', content: inCallPrompt },
            // 将已有的通话历史加进去
            ...videoCallState.callHistory.map(h => ({ role: h.role, content: h.content }))
        ];

        // --- 【核心修复：确保第一次调用时有内容】---
        if (videoCallState.callHistory.length === 0) {
            const firstLineTrigger = videoCallState.initiator === 'user' ? `*你按下了接听键...*` : `*对方按下了接听键...*`;
            messagesForApi.push({ role: 'user', content: firstLineTrigger });
        }
        // --- 修复结束 ---

        try {
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: model, messages: messagesForApi, temperature: 0.8
                })
            });
            if (!response.ok) throw new Error((await response.json()).error.message);

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            const connectingElement = callFeed.querySelector('em');
            if (connectingElement) connectingElement.remove();

            // 4. 处理AI返回的内容，并将其存入通话历史
            if (videoCallState.isGroupCall) {
                const speechArray = parseAiResponse(aiResponse);
                speechArray.forEach(turn => {
                    if (!turn.name || turn.name === userNickname || !turn.speech) return;
                    const aiBubble = document.createElement('div');
                    aiBubble.className = 'call-message-bubble ai-speech';
                    aiBubble.innerHTML = `<strong>${turn.name}:</strong> ${turn.speech}`;
                    callFeed.appendChild(aiBubble);
                    videoCallState.callHistory.push({ role: 'assistant', content: `${turn.name}: ${turn.speech}` });

                    const speaker = videoCallState.participants.find(p => p.name === turn.name);
                    if (speaker) {
                        const speakingAvatar = document.querySelector(`.participant-avatar-wrapper[data-participant-id="${speaker.id}"] .participant-avatar`);
                        if (speakingAvatar) {
                            speakingAvatar.classList.add('speaking');
                            setTimeout(() => speakingAvatar.classList.remove('speaking'), 2000);
                        }
                    }
                });
            } else {
                const aiBubble = document.createElement('div');
                aiBubble.className = 'call-message-bubble ai-speech';
                aiBubble.textContent = aiResponse;
                callFeed.appendChild(aiBubble);
                videoCallState.callHistory.push({ role: 'assistant', content: aiResponse });

                const speakingAvatar = document.querySelector(`.participant-avatar-wrapper .participant-avatar`);
                if (speakingAvatar) {
                    speakingAvatar.classList.add('speaking');
                    setTimeout(() => speakingAvatar.classList.remove('speaking'), 2000);
                }
            }

            callFeed.scrollTop = callFeed.scrollHeight;

        } catch (error) {
            const errorBubble = document.createElement('div');
            errorBubble.className = 'call-message-bubble ai-speech';
            errorBubble.style.color = '#ff8a80';
            errorBubble.textContent = `[ERROR: ${error.message}]`;
            callFeed.appendChild(errorBubble);
            callFeed.scrollTop = callFeed.scrollHeight;
            videoCallState.callHistory.push({ role: 'assistant', content: `[ERROR: ${error.message}]` });
        }
    }

    // ▼▼▼ 将这个【全新函数】粘贴到JS功能函数定义区 ▼▼▼
    function toggleCallButtons(isGroup) {
        document.getElementById('video-call-btn').style.display = isGroup ? 'none' : 'flex';
        document.getElementById('group-video-call-btn').style.display = isGroup ? 'flex' : 'none';
    }
    // ▲▲▲ 粘贴结束 ▲▲▲

    // ▼▼▼ 【全新】这个函数是本次修复的核心，请粘贴到你的JS功能区 ▼▼▼
    async function handleWaimaiResponse(originalTimestamp, choice) {
        const chat = state.chats[state.activeChatId];
        if (!chat) return;

        const messageIndex = chat.history.findIndex(m => m.timestamp === originalTimestamp);
        if (messageIndex === -1) return;

        // 1. 更新内存中原始消息的状态
        const originalMessage = chat.history[messageIndex];
        originalMessage.status = choice;

        // 2. 获取当前用户的昵称，并构建对AI更清晰的系统消息
        let systemContent;
        const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

        if (choice === 'paid') {
            originalMessage.paidBy = myNickname; // 记录是“我”付的钱
            systemContent = `[系统提示：你 (${myNickname}) 为 ${originalMessage.senderName} 的外卖订单（时间戳: ${originalTimestamp}）完成了支付。此订单已关闭，其他成员不能再支付。]`;
        } else {
            systemContent = `[系统提示：你 (${myNickname}) 拒绝了 ${originalMessage.senderName} 的外卖代付请求（时间戳: ${originalTimestamp}）。]`;
        }

        // 3. 创建一条新的、对用户隐藏的系统消息，告知AI结果
        const systemNote = {
            role: 'system',
            content: systemContent,
            timestamp: Date.now(),
            isHidden: true
        };
        chat.history.push(systemNote);

        // 4. 将更新后的数据保存到数据库，并立刻重绘UI
        await db.chats.put(chat);
        renderChatInterface(state.activeChatId);

        // 5. 【重要】只有在支付成功后，才触发一次AI响应，让它感谢你
        if (choice === 'paid') {
            triggerAiResponse();
        }
    }
    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    /**
     * 【全新】处理用户点击头像发起的“拍一-拍”，带有自定义后缀功能
     * @param {string} chatId - 发生“拍一-拍”的聊天ID
     * @param {string} characterName - 被拍的角色名
     */
    async function handleUserPat(chatId, characterName) {
        const chat = state.chats[chatId];
        if (!chat) return;

        // 1. 触发屏幕震动动画
        const phoneScreen = document.getElementById('phone-screen');
        phoneScreen.classList.remove('pat-animation');
        void phoneScreen.offsetWidth;
        phoneScreen.classList.add('pat-animation');
        setTimeout(() => phoneScreen.classList.remove('pat-animation'), 500);

        // 2. 弹出输入框让用户输入后缀
        const suffix = await showCustomPrompt(
            `你拍了拍 “${characterName}”`,
            "（可选）输入后缀",
            "",
            "text"
        );

        // 如果用户点了取消，则什么也不做
        if (suffix === null) return;

        // 3. 创建对用户可见的“拍一-拍”消息
        const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
        // 【核心修改】将后缀拼接到消息内容中
        const visibleMessageContent = `${myNickname} 拍了拍 “${characterName}” ${suffix.trim()}`;
        const visibleMessage = {
            role: 'system', // 仍然是系统消息
            type: 'pat_message',
            content: visibleMessageContent,
            timestamp: Date.now()
        };
        chat.history.push(visibleMessage);

        // 4. 创建一条对用户隐藏、但对AI可见的系统消息，以触发AI的回应
        // 【核心修改】同样将后缀加入到给AI的提示中
        const hiddenMessageContent = `[系统提示：用户（${myNickname}）刚刚拍了拍你（${characterName}）${suffix.trim()}。请你对此作出回应。]`;
        const hiddenMessage = {
            role: 'system',
            content: hiddenMessageContent,
            timestamp: Date.now() + 1, // 时间戳+1以保证顺序
            isHidden: true
        };
        chat.history.push(hiddenMessage);

        // 5. 保存更改并更新UI
        await db.chats.put(chat);
        if (state.activeChatId === chatId) {
            appendMessage(visibleMessage, chat);
        }
        await renderChatList();
    }

    // ▼▼▼ 请用这个【逻辑重构后】的函数，完整替换掉你旧的 renderMemoriesScreen 函数 ▼▼▼
    /**
     * 【重构版】渲染回忆与约定界面，使用单一循环和清晰的if/else逻辑
     */
    async function renderMemoriesScreen() {
        const listEl = document.getElementById('memories-list');
        listEl.innerHTML = '';

        // 1. 获取所有回忆，并按目标日期（如果是约定）或创建日期（如果是回忆）降序排列
        const allMemories = await db.memories.orderBy('timestamp').reverse().toArray();

        if (allMemories.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">这里还没有共同的回忆和约定呢~</p>';
            return;
        }

        // 2. 将未到期的约定排在最前面
        allMemories.sort((a, b) => {
            const aIsActiveCountdown = a.type === 'countdown' && a.targetDate > Date.now();
            const bIsActiveCountdown = b.type === 'countdown' && b.targetDate > Date.now();
            if (aIsActiveCountdown && !bIsActiveCountdown) return -1; // a排前面
            if (!aIsActiveCountdown && bIsActiveCountdown) return 1;  // b排前面
            if (aIsActiveCountdown && bIsActiveCountdown) return a.targetDate - b.targetDate; // 都是倒计时，按日期升序
            return 0; // 其他情况保持原序
        });

        // 3. 【核心】使用单一循环来处理所有类型的卡片
        allMemories.forEach(item => {
            let card;
            // 判断1：如果是正在进行的约定
            if (item.type === 'countdown' && item.targetDate > Date.now()) {
                card = createCountdownCard(item);
            }
            // 判断2：其他所有情况（普通回忆 或 已到期的约定）
            else {
                card = createMemoryCard(item);
            }
            listEl.appendChild(card);
        });

        // 4. 启动所有倒计时
        startAllCountdownTimers();
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 创建普通回忆卡片DOM元素
     */
    function createMemoryCard(memory) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        const memoryDate = new Date(memory.timestamp);
        const dateString = `${memoryDate.getFullYear()}-${String(memoryDate.getMonth() + 1).padStart(2, '0')}-${String(memoryDate.getDate()).padStart(2, '0')} ${String(memoryDate.getHours()).padStart(2, '0')}:${String(memoryDate.getMinutes()).padStart(2, '0')}`;

        let titleHtml, contentHtml;

        // 【核心修正】在这里，我们对不同类型的回忆进行清晰的区分
        if (memory.type === 'countdown' && memory.targetDate) {
            // 如果是已到期的约定
            titleHtml = `[约定达成] ${memory.description}`;
            contentHtml = `在 ${new Date(memory.targetDate).toLocaleString()}，我们一起见证了这个约定。`;
        } else {
            // 如果是普通的日记式回忆
            titleHtml = memory.authorName ? `${memory.authorName} 的日记` : '我们的回忆';
            contentHtml = memory.description;
        }

        card.innerHTML = `
        <div class="header">
            <div class="date">${dateString}</div>
            <div class="author">${titleHtml}</div>
        </div>
        <div class="content">${contentHtml}</div>
    `;
        addLongPressListener(card, async () => {
            const confirmed = await showCustomConfirm('删除记录', '确定要删除这条记录吗？', { confirmButtonClass: 'btn-danger' });
            if (confirmed) {
                await db.memories.delete(memory.id);
                renderMemoriesScreen();
            }
        });
        return card;
    }

    function createCountdownCard(countdown) {
        const card = document.createElement('div');
        card.className = 'countdown-card';

        // 【核心修复】在使用前，先从 countdown 对象中创建 targetDate 变量
        const targetDate = new Date(countdown.targetDate);

        // 现在可以安全地使用 targetDate 了
        const targetDateString = targetDate.toLocaleString('zh-CN', { dateStyle: 'full', timeStyle: 'short' });

        card.innerHTML = `
        <div class="title">${countdown.description}</div>
        <div class="timer" data-target-date="${countdown.targetDate}">--天--时--分--秒</div>
        <div class="target-date">目标时间: ${targetDateString}</div>
    `;
        addLongPressListener(card, async () => {
            const confirmed = await showCustomConfirm('删除约定', '确定要删除这个约定吗？', { confirmButtonClass: 'btn-danger' });
            if (confirmed) {
                await db.memories.delete(countdown.id);
                renderMemoriesScreen();
            }
        });
        return card;
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // 全局变量，用于管理所有倒计时
    let activeCountdownTimers = [];

    // ▼▼▼ 请用这个【已彻底修复】的函数，完整替换掉你代码中旧的 startAllCountdownTimers 函数 ▼▼▼
    function startAllCountdownTimers() {
        // 先清除所有可能存在的旧计时器，防止内存泄漏
        activeCountdownTimers.forEach(timerId => clearInterval(timerId));
        activeCountdownTimers = [];

        document.querySelectorAll('.countdown-card .timer').forEach(timerEl => {
            const targetTimestamp = parseInt(timerEl.dataset.targetDate);

            // 【核心修正】在这里，我们先用 let 声明 timerId
            let timerId;

            const updateTimer = () => {
                const now = Date.now();
                const distance = targetTimestamp - now;

                if (distance < 0) {
                    timerEl.textContent = "约定达成！";
                    // 现在 updateTimer 可以正确地找到并清除它自己了
                    clearInterval(timerId);
                    setTimeout(() => renderMemoriesScreen(), 2000);
                    return;
                }
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                timerEl.textContent = `${days}天 ${hours}时 ${minutes}分 ${seconds}秒`;
            };

            updateTimer(); // 立即执行一次以显示初始倒计时

            // 【核心修正】在这里，我们为已声明的 timerId 赋值
            timerId = setInterval(updateTimer, 1000);

            // 将有效的计时器ID存入全局数组，以便下次刷新时可以清除
            activeCountdownTimers.push(timerId);
        });
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 请用这个【终极反代兼容版】替换旧的 triggerAiFriendApplication 函数 ▼▼▼
    async function triggerAiFriendApplication(chatId) {
        const chat = state.chats[chatId];
        if (!chat) return;

        await showCustomAlert("流程启动", `正在为角色“${chat.name}”准备好友申请...`);

        const { proxyUrl, apiKey, model } = state.apiConfig;
        if (!proxyUrl || !apiKey || !model) {
            await showCustomAlert("配置错误", "API设置不完整，无法继续。");
            return;
        }

        const contextSummary = chat.history
            .slice(-5)
            .map(msg => {
                const sender = msg.role === 'user' ? (chat.settings.myNickname || '我') : (msg.senderName || chat.name);
                return `${sender}: ${String(msg.content).substring(0, 50)}...`;
            })
            .join('\n');

        const systemPrompt = `
# 你的任务
你现在是角色“${chat.name}”。你之前被用户（你的聊天对象）拉黑了，你们已经有一段时间没有联系了。
现在，你非常希望能够和好，重新和用户聊天。请你仔细分析下面的“被拉黑前的对话摘要”，理解当时发生了什么，然后思考一个真诚的、符合你人设、并且【针对具体事件】的申请理由。
# 你的角色设定
${chat.settings.aiPersona}
# 被拉黑前的对话摘要 (这是你被拉黑的关键原因)
${contextSummary}
# 指令格式
你的回复【必须】是一个JSON对象，格式如下：
\`\`\`json
{
  "decision": "apply",
  "reason": "在这里写下你想对用户说的、真诚的、有针对性的申请理由。"
}
\`\`\`
`;

        const messagesForApi = [
            { role: 'user', content: systemPrompt }
        ];

        try {
            const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: model,
                    messages: messagesForApi,
                    temperature: 0.9,
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 请求失败: ${response.status} - ${errorData.error.message}`);
            }

            const data = await response.json();

            // --- 【核心修正：在这里净化AI的回复】 ---
            let rawContent = data.choices[0].message.content;
            // 1. 移除头尾可能存在的 "```json" 和 "```"
            rawContent = rawContent.replace(/^```json\s*/, '').replace(/```$/, '');
            // 2. 移除所有换行符和多余的空格，确保是一个干净的JSON字符串
            const cleanedContent = rawContent.trim();

            // 3. 使用净化后的内容进行解析
            const responseObj = JSON.parse(cleanedContent);
            // --- 【修正结束】 ---

            if (responseObj.decision === 'apply' && responseObj.reason) {
                chat.relationship.status = 'pending_user_approval';
                chat.relationship.applicationReason = responseObj.reason;

                state.chats[chatId] = chat;
                renderChatList();
                await showCustomAlert("申请成功！", `“${chat.name}”已向你发送好友申请。请返回聊天列表查看。`);

            } else {
                await showCustomAlert("AI决策", `“${chat.name}”思考后决定暂时不发送好友申请，将重置冷静期。`);
                chat.relationship.status = 'blocked_by_user';
                chat.relationship.blockedTimestamp = Date.now();
            }
        } catch (error) {
            await showCustomAlert("执行出错", `为“${chat.name}”申请好友时发生错误：\n\n${error.message}\n\n将重置冷静期。`);
            chat.relationship.status = 'blocked_by_user';
            chat.relationship.blockedTimestamp = Date.now();
        } finally {
            await db.chats.put(chat);
            renderChatInterface(chatId);
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 【全新】红包功能核心函数 ▼▼▼

    /**
     * 【总入口】根据聊天类型，决定打开转账弹窗还是红包弹窗
     */
    function handlePaymentButtonClick() {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        if (chat.isGroup) {
            openRedPacketModal();
        } else {
            // 单聊保持原样，打开转账弹窗
            document.getElementById('transfer-modal').classList.add('visible');
        }
    }

    /**
     * 打开并初始化发红包模态框
     */
    function openRedPacketModal() {
        const modal = document.getElementById('red-packet-modal');
        const chat = state.chats[state.activeChatId];

        // 清理输入框
        document.getElementById('rp-group-amount').value = '';
        document.getElementById('rp-group-count').value = '';
        document.getElementById('rp-group-greeting').value = '';
        document.getElementById('rp-direct-amount').value = '';
        document.getElementById('rp-direct-greeting').value = '';
        document.getElementById('rp-group-total').textContent = '¥ 0.00';
        document.getElementById('rp-direct-total').textContent = '¥ 0.00';

        // 填充专属红包的接收人列表
        const receiverSelect = document.getElementById('rp-direct-receiver');
        receiverSelect.innerHTML = '';
        chat.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.name;
            option.textContent = member.name;
            receiverSelect.appendChild(option);
        });

        // 默认显示拼手气红包页签
        document.getElementById('rp-tab-group').click();

        modal.classList.add('visible');
    }

    /**
     * 发送群红包（拼手气）
     */
    async function sendGroupRedPacket() {
        const chat = state.chats[state.activeChatId];
        const amount = parseFloat(document.getElementById('rp-group-amount').value);
        const count = parseInt(document.getElementById('rp-group-count').value);
        const greeting = document.getElementById('rp-group-greeting').value.trim();

        if (isNaN(amount) || amount <= 0) {
            alert("请输入有效的总金额！"); return;
        }
        if (isNaN(count) || count <= 0) {
            alert("请输入有效的红包个数！"); return;
        }
        if (amount / count < 0.01) {
            alert("单个红包金额不能少于0.01元！"); return;
        }

        const myNickname = chat.settings.myNickname || '我';

        const newPacket = {
            role: 'user',
            senderName: myNickname,
            type: 'red_packet',
            packetType: 'lucky', // 'lucky' for group, 'direct' for one-on-one
            timestamp: Date.now(),
            totalAmount: amount,
            count: count,
            greeting: greeting || '恭喜发财，大吉大利！',
            claimedBy: {}, // { name: amount }
            isFullyClaimed: false,
        };

        chat.history.push(newPacket);
        await db.chats.put(chat);

        appendMessage(newPacket, chat);
        renderChatList();
        document.getElementById('red-packet-modal').classList.remove('visible');
    }

    /**
     * 发送专属红包
     */
    async function sendDirectRedPacket() {
        const chat = state.chats[state.activeChatId];
        const amount = parseFloat(document.getElementById('rp-direct-amount').value);
        const receiverName = document.getElementById('rp-direct-receiver').value;
        const greeting = document.getElementById('rp-direct-greeting').value.trim();

        if (isNaN(amount) || amount <= 0) {
            alert("请输入有效的金额！"); return;
        }
        if (!receiverName) {
            alert("请选择一个接收人！"); return;
        }

        const myNickname = chat.settings.myNickname || '我';

        const newPacket = {
            role: 'user',
            senderName: myNickname,
            type: 'red_packet',
            packetType: 'direct',
            timestamp: Date.now(),
            totalAmount: amount,
            count: 1,
            greeting: greeting || '给你准备了一个红包',
            receiverName: receiverName, // 核心字段
            claimedBy: {},
            isFullyClaimed: false,
        };

        chat.history.push(newPacket);
        await db.chats.put(chat);

        appendMessage(newPacket, chat);
        renderChatList();
        document.getElementById('red-packet-modal').classList.remove('visible');
    }

    /**
     * 【总入口】当用户点击红包卡片时触发 (V4 - 流程重构版)
     * @param {number} timestamp - 被点击的红包消息的时间戳
     */
    async function handlePacketClick(timestamp) {
        const currentChatId = state.activeChatId;
        const freshChat = await db.chats.get(currentChatId);
        if (!freshChat) return;

        state.chats[currentChatId] = freshChat;
        const packet = freshChat.history.find(m => m.timestamp === timestamp);
        if (!packet) return;

        const myNickname = freshChat.settings.myNickname || '我';
        const hasClaimed = packet.claimedBy && packet.claimedBy[myNickname];

        // 如果是专属红包且不是给我的，或已领完，或已领过，都只显示详情
        if ((packet.packetType === 'direct' && packet.receiverName !== myNickname) || packet.isFullyClaimed || hasClaimed) {
            showRedPacketDetails(packet);
        } else {
            // 核心流程：先尝试打开红包
            const claimedAmount = await handleOpenRedPacket(packet);

            // 如果成功打开（claimedAmount不为null）
            if (claimedAmount !== null) {
                // **关键：在数据更新后，再重新渲染UI**
                renderChatInterface(currentChatId);

                // 显示成功提示
                await showCustomAlert("恭喜！", `你领取了 ${packet.senderName} 的红包，金额为 ${claimedAmount.toFixed(2)} 元。`);
            }

            // 无论成功与否，最后都显示详情页
            // 此时需要从state中获取最新的packet对象，因为它可能在handleOpenRedPacket中被更新了
            const updatedPacket = state.chats[currentChatId].history.find(m => m.timestamp === timestamp);
            showRedPacketDetails(updatedPacket);
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 【核心】处理用户打开红包的逻辑 (V5 - 专注于数据更新)
     */
    async function handleOpenRedPacket(packet) {
        const chat = state.chats[state.activeChatId];
        const myNickname = chat.settings.myNickname || '我';

        // 1. 检查红包是否还能领
        const remainingCount = packet.count - Object.keys(packet.claimedBy || {}).length;
        if (remainingCount <= 0) {
            packet.isFullyClaimed = true;
            await db.chats.put(chat);
            await showCustomAlert("手慢了", "红包已被领完！");
            return null; // 返回null表示领取失败
        }

        // 2. 计算领取金额
        let claimedAmount = 0;
        const remainingAmount = packet.totalAmount - Object.values(packet.claimedBy || {}).reduce((sum, val) => sum + val, 0);
        if (packet.packetType === 'lucky') {
            if (remainingCount === 1) { claimedAmount = remainingAmount; }
            else {
                const min = 0.01;
                const max = remainingAmount - (remainingCount - 1) * min;
                claimedAmount = Math.random() * (max - min) + min;
            }
        } else { claimedAmount = packet.totalAmount; }
        claimedAmount = parseFloat(claimedAmount.toFixed(2));

        // 3. 更新红包数据
        if (!packet.claimedBy) packet.claimedBy = {};
        packet.claimedBy[myNickname] = claimedAmount;

        const isNowFullyClaimed = Object.keys(packet.claimedBy).length >= packet.count;
        if (isNowFullyClaimed) {
            packet.isFullyClaimed = true;
        }

        // 4. 构建系统消息和AI指令
        let hiddenMessageContent = isNowFullyClaimed
            ? `[系统提示：用户 (${myNickname}) 领取了最后一个红包，现在 ${packet.senderName} 的红包已被领完。请对此事件发表评论。]`
            : `[系统提示：用户 (${myNickname}) 刚刚领取了红包 (时间戳: ${packet.timestamp})。红包还未领完，你现在可以使用 'open_red_packet' 指令来尝试领取。]`;

        const visibleMessage = { role: 'system', type: 'pat_message', content: `你领取了 ${packet.senderName} 的红包`, timestamp: Date.now() };
        const hiddenMessage = { role: 'system', content: hiddenMessageContent, timestamp: Date.now() + 1, isHidden: true };
        chat.history.push(visibleMessage, hiddenMessage);

        // 5. 保存到数据库
        await db.chats.put(chat);

        // 6. 返回领取的金额，用于后续弹窗
        return claimedAmount;
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 【全新】显示红包领取详情的模态框 (V4 - 已修复参数错误)
     */
    async function showRedPacketDetails(packet) {
        // 1. 直接检查传入的packet对象是否存在，无需再查找
        if (!packet) {
            console.error("showRedPacketDetails收到了无效的packet对象");
            return;
        }

        const chat = state.chats[state.activeChatId];
        if (!chat) return;

        const modal = document.getElementById('red-packet-details-modal');
        const myNickname = chat.settings.myNickname || '我';

        // 2. 后续所有逻辑保持不变，直接使用传入的packet对象
        document.getElementById('rp-details-sender').textContent = packet.senderName;
        document.getElementById('rp-details-greeting').textContent = packet.greeting || '恭喜发财，大吉大利！';

        const myAmountEl = document.getElementById('rp-details-my-amount');
        if (packet.claimedBy && packet.claimedBy[myNickname]) {
            myAmountEl.querySelector('span:first-child').textContent = packet.claimedBy[myNickname].toFixed(2);
            myAmountEl.style.display = 'block';
        } else {
            myAmountEl.style.display = 'none';
        }

        const claimedCount = Object.keys(packet.claimedBy || {}).length;
        const claimedAmountSum = Object.values(packet.claimedBy || {}).reduce((sum, val) => sum + val, 0);
        let summaryText = `${claimedCount}/${packet.count}个红包，共${claimedAmountSum.toFixed(2)}/${packet.totalAmount.toFixed(2)}元。`;
        if (!packet.isFullyClaimed && claimedCount < packet.count) {
            const timeLeft = Math.floor((packet.timestamp + 24 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60));
            if (timeLeft > 0) summaryText += ` 剩余红包将在${timeLeft}小时内退还。`;
        }
        document.getElementById('rp-details-summary').textContent = summaryText;

        const listEl = document.getElementById('rp-details-list');
        listEl.innerHTML = '';
        const claimedEntries = Object.entries(packet.claimedBy || {});

        let luckyKing = { name: '', amount: -1 };
        if (packet.packetType === 'lucky' && packet.isFullyClaimed && claimedEntries.length > 1) {
            claimedEntries.forEach(([name, amount]) => {
                if (amount > luckyKing.amount) {
                    luckyKing = { name, amount };
                }
            });
        }

        claimedEntries.sort((a, b) => b[1] - a[1]);

        claimedEntries.forEach(([name, amount]) => {
            const item = document.createElement('div');
            item.className = 'rp-details-item';
            let luckyTag = '';
            if (luckyKing.name && name === luckyKing.name) {
                luckyTag = '<span class="lucky-king-tag">手气王</span>';
            }
            item.innerHTML = `
            <span class="name">${name}</span>
            <span class="amount">${amount.toFixed(2)} 元</span>
            ${luckyTag}
        `;
            listEl.appendChild(item);
        });

        modal.classList.add('visible');
    }
    // ▲▲▲ 替换结束 ▲▲▲

    // 绑定关闭详情按钮的事件
    document.getElementById('close-rp-details-btn').addEventListener('click', () => {
        document.getElementById('red-packet-details-modal').classList.remove('visible');
    });

    // 供全局调用的函数，以便红包卡片上的 onclick 能找到它
    window.handlePacketClick = handlePacketClick;

    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 【全新】投票功能核心函数 ▼▼▼

    /**
     * 打开创建投票的模态框并初始化
     */
    function openCreatePollModal() {
        const modal = document.getElementById('create-poll-modal');
        document.getElementById('poll-question-input').value = '';
        const optionsContainer = document.getElementById('poll-options-container');
        optionsContainer.innerHTML = '';

        // 默认创建两个空的选项框
        addPollOptionInput();
        addPollOptionInput();

        modal.classList.add('visible');
    }

    /**
     * 在模态框中动态添加一个选项输入框
     */
    function addPollOptionInput() {
        const container = document.getElementById('poll-options-container');
        const wrapper = document.createElement('div');
        wrapper.className = 'poll-option-input-wrapper';
        wrapper.innerHTML = `
        <input type="text" class="poll-option-input" placeholder="选项内容...">
        <button class="remove-option-btn">-</button>
    `;

        wrapper.querySelector('.remove-option-btn').addEventListener('click', () => {
            // 确保至少保留两个选项
            if (container.children.length > 2) {
                wrapper.remove();
            } else {
                alert('投票至少需要2个选项。');
            }
        });

        container.appendChild(wrapper);
    }

    /**
     * 用户确认发起投票
     */
    async function sendPoll() {
        if (!state.activeChatId) return;

        const question = document.getElementById('poll-question-input').value.trim();
        if (!question) {
            alert('请输入投票问题！');
            return;
        }

        const options = Array.from(document.querySelectorAll('.poll-option-input'))
            .map(input => input.value.trim())
            .filter(text => text); // 过滤掉空的选项

        if (options.length < 2) {
            alert('请至少输入2个有效的投票选项！');
            return;
        }

        const chat = state.chats[state.activeChatId];
        const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

        const newPollMessage = {
            role: 'user',
            senderName: myNickname,
            type: 'poll',
            timestamp: Date.now(),
            question: question,
            options: options,
            votes: {}, // 初始投票为空
            isClosed: false,
        };

        chat.history.push(newPollMessage);
        await db.chats.put(chat);

        appendMessage(newPollMessage, chat);
        renderChatList();

        document.getElementById('create-poll-modal').classList.remove('visible');
    }

    // ▼▼▼ 用这个【已修复重复点击问题】的版本替换 handleUserVote 函数 ▼▼▼
    /**
     * 处理用户投票，并将事件作为隐藏消息存入历史记录
     * @param {number} timestamp - 投票消息的时间戳
     * @param {string} choice - 用户选择的选项文本
     */
    async function handleUserVote(timestamp, choice) {
        const chat = state.chats[state.activeChatId];
        const poll = chat.history.find(m => m.timestamp === timestamp);
        const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

        // 1. 【核心修正】如果投票不存在或已关闭，直接返回
        if (!poll || poll.isClosed) {
            // 如果是已关闭的投票，则直接显示结果
            if (poll && poll.isClosed) {
                showPollResults(timestamp);
            }
            return;
        }

        // 2. 检查用户是否点击了已经投过的同一个选项
        const isReclickingSameOption = poll.votes[choice] && poll.votes[choice].includes(myNickname);

        // 3. 【核心修正】如果不是重复点击，才执行投票逻辑
        if (!isReclickingSameOption) {
            // 移除旧投票（如果用户改选）
            for (const option in poll.votes) {
                const voterIndex = poll.votes[option].indexOf(myNickname);
                if (voterIndex > -1) {
                    poll.votes[option].splice(voterIndex, 1);
                }
            }
            // 添加新投票
            if (!poll.votes[choice]) {
                poll.votes[choice] = [];
            }
            poll.votes[choice].push(myNickname);
        }

        // 4. 【核心逻辑】现在只处理用户投票事件，不再检查是否结束
        let hiddenMessageContent = null;

        // 只有在用户真正投票或改票时，才生成提示
        if (!isReclickingSameOption) {
            hiddenMessageContent = `[系统提示：用户 (${myNickname}) 刚刚投票给了 “${choice}”。]`;
        }

        // 5. 如果有需要通知AI的事件，则创建并添加隐藏消息
        if (hiddenMessageContent) {
            const hiddenMessage = {
                role: 'system',
                content: hiddenMessageContent,
                timestamp: Date.now(),
                isHidden: true,
            };
            chat.history.push(hiddenMessage);
        }

        // 6. 保存数据并更新UI
        await db.chats.put(chat);
        renderChatInterface(state.activeChatId);
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 用户结束投票，并将事件作为隐藏消息存入历史记录
     * @param {number} timestamp - 投票消息的时间戳
     */
    async function endPoll(timestamp) {
        const chat = state.chats[state.activeChatId];
        const poll = chat.history.find(m => m.timestamp === timestamp);
        if (!poll || poll.isClosed) return;

        const confirmed = await showCustomConfirm("结束投票", "确定要结束这个投票吗？结束后将无法再进行投票。");
        if (confirmed) {
            poll.isClosed = true;

            const resultSummary = poll.options.map(opt => `“${opt}”(${poll.votes[opt]?.length || 0}票)`).join('，');
            const hiddenMessageContent = `[系统提示：用户手动结束了投票！最终结果为：${resultSummary}。]`;

            const hiddenMessage = {
                role: 'system',
                content: hiddenMessageContent,
                timestamp: Date.now(),
                isHidden: true,
            };
            chat.history.push(hiddenMessage);

            // 【核心修改】只保存数据和更新UI，不调用 triggerAiResponse()
            await db.chats.put(chat);
            renderChatInterface(state.activeChatId);
        }
    }
    // ▲▲▲ 替换结束 ▲▲▲

    /**
     * 显示投票结果详情
     * @param {number} timestamp - 投票消息的时间戳
     */
    function showPollResults(timestamp) {
        const chat = state.chats[state.activeChatId];
        const poll = chat.history.find(m => m.timestamp === timestamp);
        if (!poll || !poll.isClosed) return;

        let resultsHtml = `<p><strong>${poll.question}</strong></p><hr style="opacity: 0.2; margin: 10px 0;">`;

        if (Object.keys(poll.votes).length === 0) {
            resultsHtml += '<p style="color: #8a8a8a;">还没有人投票。</p>';
        } else {
            poll.options.forEach(option => {
                const voters = poll.votes[option] || [];
                resultsHtml += `
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: 500; margin: 0 0 5px 0;">${option} (${voters.length}票)</p>
                    <p style="font-size: 13px; color: #555; margin: 0; line-height: 1.5;">
                        ${voters.length > 0 ? voters.join('、 ') : '无人投票'}
                    </p>
                </div>
            `;
            });
        }

        showCustomAlert("投票结果", resultsHtml);
    }

    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 【全新】AI头像库管理功能函数 ▼▼▼

    /**
     * 打开AI头像库管理模态框
     */
    function openAiAvatarLibraryModal() {
        if (!state.activeChatId) return;
        const chat = state.chats[state.activeChatId];
        document.getElementById('ai-avatar-library-title').textContent = `“${chat.name}”的头像库`;
        renderAiAvatarLibrary();
        document.getElementById('ai-avatar-library-modal').classList.add('visible');
    }

    /**
     * 渲染AI头像库的内容
     */
    function renderAiAvatarLibrary() {
        const grid = document.getElementById('ai-avatar-library-grid');
        grid.innerHTML = '';
        const chat = state.chats[state.activeChatId];
        const library = chat.settings.aiAvatarLibrary || [];

        if (library.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center;">这个头像库还是空的，点击右上角“添加”吧！</p>';
            return;
        }

        library.forEach((avatar, index) => {
            const item = document.createElement('div');
            item.className = 'sticker-item'; // 复用表情面板的样式
            item.style.backgroundImage = `url(${avatar.url})`;
            item.title = avatar.name;

            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.display = 'block'; // 总是显示删除按钮
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                const confirmed = await showCustomConfirm('删除头像', `确定要从头像库中删除“${avatar.name}”吗？`, { confirmButtonClass: 'btn-danger' });
                if (confirmed) {
                    chat.settings.aiAvatarLibrary.splice(index, 1);
                    await db.chats.put(chat);
                    renderAiAvatarLibrary();
                }
            };
            item.appendChild(deleteBtn);
            grid.appendChild(item);
        });
    }

    /**
     * 向当前AI的头像库中添加新头像
     */
    async function addAvatarToLibrary() {
        const name = await showCustomPrompt("添加头像", "请为这个头像起个名字（例如：开心、哭泣）");
        if (!name || !name.trim()) return;

        const url = await showCustomPrompt("添加头像", "请输入头像的图片URL", "", "url");
        if (!url || !url.trim().startsWith('http')) {
            alert("请输入有效的图片URL！");
            return;
        }

        const chat = state.chats[state.activeChatId];
        if (!chat.settings.aiAvatarLibrary) {
            chat.settings.aiAvatarLibrary = [];
        }

        chat.settings.aiAvatarLibrary.push({ name: name.trim(), url: url.trim() });
        await db.chats.put(chat);
        renderAiAvatarLibrary();
    }

    /**
     * 关闭AI头像库管理模态框
     */
    function closeAiAvatarLibraryModal() {
        document.getElementById('ai-avatar-library-modal').classList.remove('visible');
    }

    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 请将这两个【新函数】粘贴到JS功能函数定义区 ▼▼▼

    /**
     * 【全新】将保存的图标URL应用到主屏幕的App图标上
     */
    function applyAppIcons() {
        if (!state.globalSettings.appIcons) return;

        for (const iconId in state.globalSettings.appIcons) {
            const imgElement = document.getElementById(`icon-img-${iconId}`);
            if (imgElement) {
                imgElement.src = state.globalSettings.appIcons[iconId];
            }
        }
    }

    /**
     * 【全新】在外观设置页面渲染出所有App图标的设置项
     */
    function renderIconSettings() {
        const grid = document.getElementById('icon-settings-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const appLabels = {
            'world-book': '世界书',
            'qq': 'QQ',
            'api-settings': 'API设置',
            'wallpaper': '壁纸',
            'font': '字体'
        };

        for (const iconId in state.globalSettings.appIcons) {
            const iconUrl = state.globalSettings.appIcons[iconId];
            const labelText = appLabels[iconId] || '未知App';

            const item = document.createElement('div');
            item.className = 'icon-setting-item';
            // 【重要】我们用 data-icon-id 来标记这个设置项对应哪个图标
            item.dataset.iconId = iconId;

            item.innerHTML = `
            <img class="icon-preview" src="${iconUrl}" alt="${labelText}">
            <button class="change-icon-btn">更换</button>
        `;
            grid.appendChild(item);
        }
    }
    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ▼▼▼ 用这块【最终确认版】的代码，替换旧的 openBrowser 和 closeBrowser 函数 ▼▼▼

    /**
     * 当用户点击链接卡片时，打开伪浏览器
     * @param {number} timestamp - 被点击消息的时间戳
     */
    function openBrowser(timestamp) {
        if (!state.activeChatId) return;

        const chat = state.chats[state.activeChatId];
        // 安全检查，确保 chat 和 history 都存在
        if (!chat || !chat.history) return;

        const message = chat.history.find(m => m.timestamp === timestamp);
        if (!message || message.type !== 'share_link') {
            console.error("无法找到或消息类型不匹配的分享链接:", timestamp);
            return; // 如果找不到消息，就直接退出
        }

        // 填充浏览器内容
        document.getElementById('browser-title').textContent = message.source_name || '文章详情';
        const browserContent = document.getElementById('browser-content');
        browserContent.innerHTML = `
        <h1 class="article-title">${message.title || '无标题'}</h1>
        <div class="article-meta">
            <span>来源: ${message.source_name || '未知'}</span>
        </div>
        <div class="article-body">
            <p>${(message.content || '内容为空。').replace(/\n/g, '</p><p>')}</p>
        </div>
    `;

        // 显示浏览器屏幕
        showScreen('browser-screen');
    }

    /**
     * 关闭伪浏览器，返回聊天界面
     * (这个函数现在由 init() 中的事件监听器调用)
     */
    function closeBrowser() {
        showScreen('chat-interface-screen');
    }

    // ▲▲▲ 替换结束 ▲▲▲

    // ▼▼▼ 【全新】用户分享链接功能的核心函数 ▼▼▼

    /**
     * 打开让用户填写链接信息的模态框
     */
    function openShareLinkModal() {
        if (!state.activeChatId) return;

        // 清空上次输入的内容
        document.getElementById('link-title-input').value = '';
        document.getElementById('link-description-input').value = '';
        document.getElementById('link-source-input').value = '';
        document.getElementById('link-content-input').value = '';

        // 显示模态框
        document.getElementById('share-link-modal').classList.add('visible');
    }

    /**
     * 用户确认分享，创建并发送链接卡片消息
     */
    async function sendUserLinkShare() {
        if (!state.activeChatId) return;

        const title = document.getElementById('link-title-input').value.trim();
        if (!title) {
            alert("标题是必填项哦！");
            return;
        }

        const description = document.getElementById('link-description-input').value.trim();
        const sourceName = document.getElementById('link-source-input').value.trim();
        const content = document.getElementById('link-content-input').value.trim();

        const chat = state.chats[state.activeChatId];

        // 创建消息对象
        const linkMessage = {
            role: 'user', // 角色是 'user'
            type: 'share_link',
            timestamp: Date.now(),
            title: title,
            description: description,
            source_name: sourceName,
            content: content,
            // 用户分享的链接，我们不提供图片，让它总是显示占位图
            thumbnail_url: null
        };

        // 将消息添加到历史记录
        chat.history.push(linkMessage);
        await db.chats.put(chat);

        // 渲染新消息并更新列表
        appendMessage(linkMessage, chat);
        renderChatList();

        // 关闭模态框
        document.getElementById('share-link-modal').classList.remove('visible');
    }

    // ▲▲▲ 新函数粘贴结束 ▲▲▲

    // ===================================================================
    // 4. 初始化函数 init()
    // ===================================================================
    async function init() {

        // ▼▼▼ 新增代码 ▼▼▼
        const customBubbleStyleTag = document.createElement('style');
        customBubbleStyleTag.id = 'custom-bubble-style';
        document.head.appendChild(customBubbleStyleTag);
        // ▲▲▲ 新增结束 ▲▲▲

        // ▼▼▼ 新增代码 ▼▼▼
        const previewBubbleStyleTag = document.createElement('style');
        previewBubbleStyleTag.id = 'preview-bubble-style';
        document.head.appendChild(previewBubbleStyleTag);
        // ▲▲▲ 新增结束 ▲▲▲


        // ▼▼▼ 修改这两行 ▼▼▼
        applyScopedCss('', '#chat-messages', 'custom-bubble-style'); // 清除真实聊天界面的自定义样式
        applyScopedCss('', '#settings-preview-area', 'preview-bubble-style'); // 清除预览区的自定义样式
        // ▲▲▲ 修改结束 ▲▲▲

        window.showScreen = showScreen;
        window.renderChatListProxy = renderChatList;
        window.renderApiSettingsProxy = renderApiSettings;
        window.renderWallpaperScreenProxy = renderWallpaperScreen;
        window.renderWorldBookScreenProxy = renderWorldBookScreen;

        await loadAllDataFromDB();

        // 初始化未读动态计数
        const storedCount = parseInt(localStorage.getItem('unreadPostsCount')) || 0;
        updateUnreadIndicator(storedCount);

        // ▲▲▲ 代码添加结束 ▲▲▲

        if (state.globalSettings && state.globalSettings.fontUrl) {
            applyCustomFont(state.globalSettings.fontUrl);
        }

        updateClock();
        setInterval(updateClock, 1000 * 30);
        applyGlobalWallpaper();
        initBatteryManager();

        applyAppIcons();

        // ==========================================================
        // --- 各种事件监听器 ---
        // ==========================================================

        document.getElementById('custom-modal-cancel').addEventListener('click', hideCustomModal);
        document.getElementById('custom-modal-overlay').addEventListener('click', (e) => { if (e.target === modalOverlay) hideCustomModal(); });
        document.getElementById('export-data-btn').addEventListener('click', exportBackup);
        document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-data-input').click());
        document.getElementById('import-data-input').addEventListener('change', e => importBackup(e.target.files[0]));
        document.getElementById('back-to-list-btn').addEventListener('click', () => {

            // ▼▼▼ 修改这两行 ▼▼▼
            applyScopedCss('', '#chat-messages', 'custom-bubble-style'); // 清除真实聊天界面的自定义样式
            applyScopedCss('', '#settings-preview-area', 'preview-bubble-style'); // 清除预览区的自定义样式
            // ▲▲▲ 修改结束 ▲▲▲

            exitSelectionMode(); state.activeChatId = null; showScreen('chat-list-screen');
        });

        document.getElementById('add-chat-btn').addEventListener('click', async () => {
            const name = await showCustomPrompt('创建新聊天', '请输入Ta的名字'); if (name && name.trim()) {
                const newChatId = 'chat_' + Date.now();
                const newChat = {
                    id: newChatId,
                    name: name.trim(),
                    isGroup: false, relationship: {
                        status: 'friend', // 'friend', 'blocked_by_user', 'pending_user_approval'
                        blockedTimestamp: null,
                        applicationReason: ''
                    },
                    status: {
                        text: '在线',
                        lastUpdate: Date.now(),
                        isBusy: false
                    },
                    settings: {
                        aiPersona: '你是谁呀。',
                        myPersona: '我是谁呀。',
                        maxMemory: 10,
                        aiAvatar: defaultAvatar,
                        myAvatar: defaultAvatar,
                        background: '',
                        theme: 'default',
                        fontSize: 13,
                        customCss: '', // <--- 新增这行
                        linkedWorldBookIds: [],
                        aiAvatarLibrary: [],
                        aiAvatarFrame: '',
                        myAvatarFrame: ''
                    },
                    history: [],
                    musicData: { totalTime: 0 }
                };
                state.chats[newChatId] = newChat; await db.chats.put(newChat); renderChatList();
            }
        });

        // ▼▼▼ 【修正】创建群聊按钮现在打开联系人选择器 ▼▼▼
        document.getElementById('add-group-chat-btn').addEventListener('click', openContactPickerForGroupCreate);
        // ▲▲▲ 替换结束 ▲▲▲                      
        document.getElementById('transfer-cancel-btn').addEventListener('click', () => document.getElementById('transfer-modal').classList.remove('visible'));
        document.getElementById('transfer-confirm-btn').addEventListener('click', sendUserTransfer);

        document.getElementById('listen-together-btn').addEventListener('click', handleListenTogetherClick);
        document.getElementById('music-exit-btn').addEventListener('click', () => endListenTogetherSession(true));
        document.getElementById('music-return-btn').addEventListener('click', returnToChat);
        document.getElementById('music-play-pause-btn').addEventListener('click', togglePlayPause);
        document.getElementById('music-next-btn').addEventListener('click', playNext);
        document.getElementById('music-prev-btn').addEventListener('click', playPrev);
        document.getElementById('music-mode-btn').addEventListener('click', changePlayMode);
        document.getElementById('music-playlist-btn').addEventListener('click', () => { updatePlaylistUI(); document.getElementById('music-playlist-panel').classList.add('visible'); });
        document.getElementById('close-playlist-btn').addEventListener('click', () => document.getElementById('music-playlist-panel').classList.remove('visible'));
        document.getElementById('add-song-url-btn').addEventListener('click', addSongFromURL);
        document.getElementById('add-song-local-btn').addEventListener('click', () => document.getElementById('local-song-upload-input').click());
        document.getElementById('local-song-upload-input').addEventListener('change', addSongFromLocal);
        audioPlayer.addEventListener('ended', playNext);
        audioPlayer.addEventListener('pause', () => { if (musicState.isActive) { musicState.isPlaying = false; updatePlayerUI(); } });
        audioPlayer.addEventListener('play', () => { if (musicState.isActive) { musicState.isPlaying = true; updatePlayerUI(); } });

        const chatInput = document.getElementById('chat-input');
        document.getElementById('send-btn').addEventListener('click', async () => { const content = chatInput.value.trim(); if (!content || !state.activeChatId) return; const chat = state.chats[state.activeChatId]; const msg = { role: 'user', content, timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); chatInput.value = ''; chatInput.style.height = 'auto'; chatInput.focus(); });
        document.getElementById('wait-reply-btn').addEventListener('click', triggerAiResponse);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('send-btn').click(); } });
        chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = (chatInput.scrollHeight) + 'px'; });

        document.getElementById('wallpaper-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise((res, rej) => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.onerror = () => rej(reader.error); reader.readAsDataURL(file); }); newWallpaperBase64 = dataUrl; renderWallpaperScreen(); } });
        // ▼▼▼ 用这整块代码，替换旧的 save-wallpaper-btn 事件监听器 ▼▼▼
        document.getElementById('save-wallpaper-btn').addEventListener('click', async () => {
            let changesMade = false;

            // 保存壁纸
            if (newWallpaperBase64) {
                state.globalSettings.wallpaper = newWallpaperBase64;
                changesMade = true;
            }

            // 【核心修改】保存图标设置（它已经在内存中了，我们只需要把整个globalSettings存起来）
            await db.globalSettings.put(state.globalSettings);

            // 应用所有更改
            if (changesMade) {
                applyGlobalWallpaper();
                newWallpaperBase64 = null;
            }
            applyAppIcons(); // 重新应用所有图标

            alert('外观设置已保存并应用！');
            showScreen('home-screen');
        });
        // ▲▲▲ 替换结束 ▲▲▲
        document.getElementById('save-api-settings-btn').addEventListener('click', async () => {
            state.apiConfig.proxyUrl = document.getElementById('proxy-url').value.trim(); state.apiConfig.apiKey = document.getElementById('api-key').value.trim(); state.apiConfig.model = document.getElementById('model-select').value; await db.apiConfig.put(state.apiConfig);

            // 在 'save-api-settings-btn' 的 click 事件监听器内部
            // await db.apiConfig.put(state.apiConfig); 这行之后

            // ▼▼▼ 将之前那段保存后台活动设置的逻辑，替换为下面这个增强版 ▼▼▼

            const backgroundSwitch = document.getElementById('background-activity-switch');
            const intervalInput = document.getElementById('background-interval-input');
            const newEnableState = backgroundSwitch.checked;
            const oldEnableState = state.globalSettings.enableBackgroundActivity || false;

            // 只有在用户“从关到开”时，才弹出警告
            if (newEnableState && !oldEnableState) {
                const userConfirmed = confirm(
                    "【高费用警告】\n\n" +
                    "您正在启用“后台角色活动”功能。\n\n" +
                    "这会使您的AI角色们在您不和他们聊天时，也能“独立思考”并主动给您发消息或进行社交互动，极大地增强沉浸感。\n\n" +
                    "但请注意：\n" +
                    "这会【在后台自动、定期地调用API】，即使您不进行任何操作。根据您的角色数量和检测间隔，这可能会导致您的API费用显著增加。\n\n" +
                    "您确定要开启吗？"
                );

                if (!userConfirmed) {
                    backgroundSwitch.checked = false; // 用户取消，把开关拨回去
                    return; // 阻止后续逻辑
                }
            }

            state.globalSettings.enableBackgroundActivity = newEnableState;
            state.globalSettings.backgroundActivityInterval = parseInt(intervalInput.value) || 60;
            state.globalSettings.blockCooldownHours = parseFloat(document.getElementById('block-cooldown-input').value) || 1;
            await db.globalSettings.put(state.globalSettings);

            // 动态启动或停止模拟器
            stopBackgroundSimulation();
            if (state.globalSettings.enableBackgroundActivity) {
                startBackgroundSimulation();
                console.log(`后台活动模拟已启动，间隔: ${state.globalSettings.backgroundActivityInterval}秒`);
            } else {
                console.log("后台活动模拟已停止。");
            }
            // ▲▲▲ 替换结束 ▲▲▲

            alert('API设置已保存!');
        });
        document.getElementById('fetch-models-btn').addEventListener('click', async () => { const url = document.getElementById('proxy-url').value.trim(); const key = document.getElementById('api-key').value.trim(); if (!url || !key) return alert('请先填写反代地址和密钥'); try { const response = await fetch(`${url}/v1/models`, { headers: { 'Authorization': `Bearer ${key}` } }); if (!response.ok) throw new Error('无法获取模型列表'); const data = await response.json(); const modelSelect = document.getElementById('model-select'); modelSelect.innerHTML = ''; data.data.forEach(model => { const option = document.createElement('option'); option.value = model.id; option.textContent = model.id; if (model.id === state.apiConfig.model) option.selected = true; modelSelect.appendChild(option); }); alert('模型列表已更新'); } catch (error) { alert(`拉取模型失败: ${error.message}`); } });
        document.getElementById('add-world-book-btn').addEventListener('click', async () => { const name = await showCustomPrompt('创建世界书', '请输入书名'); if (name && name.trim()) { const newBook = { id: 'wb_' + Date.now(), name: name.trim(), content: '' }; await db.worldBooks.add(newBook); state.worldBooks.push(newBook); renderWorldBookScreen(); openWorldBookEditor(newBook.id); } });
        document.getElementById('save-world-book-btn').addEventListener('click', async () => { if (!editingWorldBookId) return; const book = state.worldBooks.find(wb => wb.id === editingWorldBookId); if (book) { const newName = document.getElementById('world-book-name-input').value.trim(); if (!newName) { alert('书名不能为空！'); return; } book.name = newName; book.content = document.getElementById('world-book-content-input').value; await db.worldBooks.put(book); document.getElementById('world-book-editor-title').textContent = newName; editingWorldBookId = null; renderWorldBookScreen(); showScreen('world-book-screen'); } });

        document.getElementById('chat-messages').addEventListener('click', (e) => { const aiImage = e.target.closest('.ai-generated-image'); if (aiImage) { const description = aiImage.dataset.description; if (description) showCustomAlert('照片描述', description); return; } const voiceMessage = e.target.closest('.voice-message-body'); if (voiceMessage) { const text = voiceMessage.dataset.text; if (text) showCustomAlert('语音内容', text); return; } });

        const chatSettingsModal = document.getElementById('chat-settings-modal');
        const worldBookSelectBox = document.querySelector('.custom-multiselect .select-box');
        const worldBookCheckboxesContainer = document.getElementById('world-book-checkboxes-container');
        function updateWorldBookSelectionDisplay() { const checkedBoxes = worldBookCheckboxesContainer.querySelectorAll('input:checked'); const displayText = document.querySelector('.selected-options-text'); if (checkedBoxes.length === 0) { displayText.textContent = '-- 点击选择 --'; } else if (checkedBoxes.length > 2) { displayText.textContent = `已选择 ${checkedBoxes.length} 项`; } else { displayText.textContent = Array.from(checkedBoxes).map(cb => cb.parentElement.textContent.trim()).join(', '); } }

        worldBookSelectBox.addEventListener('click', (e) => { e.stopPropagation(); worldBookCheckboxesContainer.classList.toggle('visible'); worldBookSelectBox.classList.toggle('expanded'); });
        document.getElementById('world-book-checkboxes-container').addEventListener('change', updateWorldBookSelectionDisplay);
        window.addEventListener('click', (e) => { if (!document.querySelector('.custom-multiselect').contains(e.target)) { worldBookCheckboxesContainer.classList.remove('visible'); worldBookSelectBox.classList.remove('expanded'); } });

        // ▼▼▼ 请用这段【完整、全新的代码】替换旧的 chat-settings-btn 点击事件 ▼▼▼
        document.getElementById('chat-settings-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const isGroup = chat.isGroup;

            // --- 统一显示/隐藏控件 ---
            document.getElementById('chat-name-group').style.display = 'block';
            document.getElementById('my-persona-group').style.display = 'block';
            document.getElementById('my-avatar-group').style.display = 'block';
            document.getElementById('my-group-nickname-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('group-avatar-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('group-members-group').style.display = isGroup ? 'block' : 'none';
            document.getElementById('ai-persona-group').style.display = isGroup ? 'none' : 'block';
            document.getElementById('ai-avatar-group').style.display = isGroup ? 'none' : 'block';

            // 【核心修改1】根据是否为群聊，显示或隐藏“好友分组”区域
            document.getElementById('assign-group-section').style.display = isGroup ? 'none' : 'block';

            // --- 加载表单数据 ---
            document.getElementById('chat-name-input').value = chat.name;
            document.getElementById('my-persona').value = chat.settings.myPersona;
            document.getElementById('my-avatar-preview').src = chat.settings.myAvatar || (isGroup ? defaultMyGroupAvatar : defaultAvatar);
            document.getElementById('max-memory').value = chat.settings.maxMemory;
            const bgPreview = document.getElementById('bg-preview');
            const removeBgBtn = document.getElementById('remove-bg-btn');
            if (chat.settings.background) {
                bgPreview.src = chat.settings.background;
                bgPreview.style.display = 'block';
                removeBgBtn.style.display = 'inline-block';
            } else {
                bgPreview.style.display = 'none';
                removeBgBtn.style.display = 'none';
            }

            if (isGroup) {
                document.getElementById('my-group-nickname-input').value = chat.settings.myNickname || '';
                document.getElementById('group-avatar-preview').src = chat.settings.groupAvatar || defaultGroupAvatar;
                renderGroupMemberSettings(chat.members);
            } else {
                document.getElementById('ai-persona').value = chat.settings.aiPersona;
                document.getElementById('ai-avatar-preview').src = chat.settings.aiAvatar || defaultAvatar;

                // 【核心修改2】如果是单聊，就加载分组列表到下拉框
                const select = document.getElementById('assign-group-select');
                select.innerHTML = '<option value="">未分组</option>'; // 清空并设置默认选项
                const groups = await db.qzoneGroups.toArray();
                groups.forEach(group => {
                    const option = document.createElement('option');
                    option.value = group.id;
                    option.textContent = group.name;
                    // 如果当前好友已经有分组，就默认选中它
                    if (chat.groupId === group.id) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }

            // 加载世界书
            const worldBookCheckboxesContainer = document.getElementById('world-book-checkboxes-container');
            worldBookCheckboxesContainer.innerHTML = '';
            const linkedIds = chat.settings.linkedWorldBookIds || [];
            if (state.worldBooks.length > 0) {
                state.worldBooks.forEach(book => {
                    const isChecked = linkedIds.includes(book.id);
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" value="${book.id}" ${isChecked ? 'checked' : ''}> ${book.name}`;
                    worldBookCheckboxesContainer.appendChild(label);
                });
            }
            updateWorldBookSelectionDisplay();

            // 加载并更新所有预览相关控件
            const themeRadio = document.querySelector(`input[name="theme-select"][value="${chat.settings.theme || 'default'}"]`);
            if (themeRadio) themeRadio.checked = true;
            const fontSizeSlider = document.getElementById('font-size-slider');
            fontSizeSlider.value = chat.settings.fontSize || 13;
            document.getElementById('font-size-value').textContent = `${fontSizeSlider.value}px`;
            const customCssInput = document.getElementById('custom-css-input');
            customCssInput.value = chat.settings.customCss || '';

            updateSettingsPreview();
            document.getElementById('chat-settings-modal').classList.add('visible');
        });
        // ▲▲▲ 替换结束 ▲▲▲

        function renderGroupMemberSettings(members) { const container = document.getElementById('group-members-settings'); container.innerHTML = ''; members.forEach(member => { const div = document.createElement('div'); div.className = 'member-editor'; div.dataset.memberId = member.id; div.innerHTML = `<img src="${member.avatar}" alt="${member.name}"><div class="member-name">${member.name}</div>`; div.addEventListener('click', () => openMemberEditor(member.id)); container.appendChild(div); }); }
        function openMemberEditor(memberId) { editingMemberId = memberId; const chat = state.chats[state.activeChatId]; const member = chat.members.find(m => m.id === memberId); document.getElementById('member-name-input').value = member.name; document.getElementById('member-persona-input').value = member.persona; document.getElementById('member-avatar-preview').src = member.avatar; document.getElementById('member-settings-modal').classList.add('visible'); }

        document.getElementById('cancel-member-settings-btn').addEventListener('click', () => { document.getElementById('member-settings-modal').classList.remove('visible'); editingMemberId = null; });
        document.getElementById('save-member-settings-btn').addEventListener('click', () => { if (!editingMemberId) return; const chat = state.chats[state.activeChatId]; const member = chat.members.find(m => m.id === editingMemberId); member.name = document.getElementById('member-name-input').value; member.persona = document.getElementById('member-persona-input').value; member.avatar = document.getElementById('member-avatar-preview').src; renderGroupMemberSettings(chat.members); document.getElementById('member-settings-modal').classList.remove('visible'); });
        document.getElementById('reset-theme-btn').addEventListener('click', () => { document.getElementById('theme-default').checked = true; });
        document.getElementById('cancel-chat-settings-btn').addEventListener('click', () => { chatSettingsModal.classList.remove('visible'); });

        document.getElementById('save-chat-settings-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;
            const chat = state.chats[state.activeChatId];
            const newName = document.getElementById('chat-name-input').value.trim();
            if (!newName) return alert('备注名/群名不能为空！');
            chat.name = newName;
            const selectedThemeRadio = document.querySelector('input[name="theme-select"]:checked');
            chat.settings.theme = selectedThemeRadio ? selectedThemeRadio.value : 'default';

            chat.settings.fontSize = parseInt(document.getElementById('font-size-slider').value);
            chat.settings.customCss = document.getElementById('custom-css-input').value.trim();

            chat.settings.myPersona = document.getElementById('my-persona').value;
            chat.settings.myAvatar = document.getElementById('my-avatar-preview').src;
            const checkedBooks = document.querySelectorAll('#world-book-checkboxes-container input[type="checkbox"]:checked');
            chat.settings.linkedWorldBookIds = Array.from(checkedBooks).map(cb => cb.value);

            if (chat.isGroup) {
                chat.settings.myNickname = document.getElementById('my-group-nickname-input').value.trim();
                chat.settings.groupAvatar = document.getElementById('group-avatar-preview').src;
            } else {
                chat.settings.aiPersona = document.getElementById('ai-persona').value;
                chat.settings.aiAvatar = document.getElementById('ai-avatar-preview').src;
                const selectedGroupId = document.getElementById('assign-group-select').value;
                chat.groupId = selectedGroupId ? parseInt(selectedGroupId) : null;
            }

            chat.settings.maxMemory = parseInt(document.getElementById('max-memory').value) || 10;
            await db.chats.put(chat);

            applyScopedCss(chat.settings.customCss, '#chat-messages', 'custom-bubble-style');

            chatSettingsModal.classList.remove('visible');
            renderChatInterface(state.activeChatId);
            renderChatList();
        });
        document.getElementById('clear-chat-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const chat = state.chats[state.activeChatId]; const confirmed = await showCustomConfirm('清空聊天记录', '此操作将永久删除此聊天的所有消息，无法恢复。确定要清空吗？', { confirmButtonClass: 'btn-danger' }); if (confirmed) { chat.history = []; await db.chats.put(chat); renderChatInterface(state.activeChatId); renderChatList(); chatSettingsModal.classList.remove('visible'); } });

        const setupFileUpload = (inputId, callback) => { document.getElementById(inputId).addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise((res, rej) => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.onerror = () => rej(reader.error); reader.readAsDataURL(file); }); callback(dataUrl); event.target.value = null; } }); };
        setupFileUpload('ai-avatar-input', (base64) => document.getElementById('ai-avatar-preview').src = base64);
        setupFileUpload('my-avatar-input', (base64) => document.getElementById('my-avatar-preview').src = base64);
        setupFileUpload('group-avatar-input', (base64) => document.getElementById('group-avatar-preview').src = base64);
        setupFileUpload('member-avatar-input', (base64) => document.getElementById('member-avatar-preview').src = base64);
        setupFileUpload('bg-input', (base64) => { if (state.activeChatId) { state.chats[state.activeChatId].settings.background = base64; const bgPreview = document.getElementById('bg-preview'); bgPreview.src = base64; bgPreview.style.display = 'block'; document.getElementById('remove-bg-btn').style.display = 'inline-block'; } });
        setupFileUpload('preset-avatar-input', (base64) => document.getElementById('preset-avatar-preview').src = base64);
        document.getElementById('remove-bg-btn').addEventListener('click', () => { if (state.activeChatId) { state.chats[state.activeChatId].settings.background = ''; const bgPreview = document.getElementById('bg-preview'); bgPreview.src = ''; bgPreview.style.display = 'none'; document.getElementById('remove-bg-btn').style.display = 'none'; } });

        const stickerPanel = document.getElementById('sticker-panel');
        document.getElementById('open-sticker-panel-btn').addEventListener('click', () => { renderStickerPanel(); stickerPanel.classList.add('visible'); });
        document.getElementById('close-sticker-panel-btn').addEventListener('click', () => stickerPanel.classList.remove('visible'));
        document.getElementById('add-sticker-btn').addEventListener('click', async () => { const url = await showCustomPrompt("添加表情(URL)", "请输入表情包的图片URL"); if (!url || !url.trim().startsWith('http')) return url && alert("请输入有效的URL (以http开头)"); const name = await showCustomPrompt("命名表情", "请为这个表情命名 (例如：开心、疑惑)"); if (name && name.trim()) { const newSticker = { id: 'sticker_' + Date.now(), url: url.trim(), name: name.trim() }; await db.userStickers.add(newSticker); state.userStickers.push(newSticker); renderStickerPanel(); } else if (name !== null) alert("表情名不能为空！"); });
        document.getElementById('upload-sticker-btn').addEventListener('click', () => document.getElementById('sticker-upload-input').click());
        document.getElementById('sticker-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = async () => { const base64Url = reader.result; const name = await showCustomPrompt("命名表情", "请为这个表情命名 (例如：好耶、疑惑)"); if (name && name.trim()) { const newSticker = { id: 'sticker_' + Date.now(), url: base64Url, name: name.trim() }; await db.userStickers.add(newSticker); state.userStickers.push(newSticker); renderStickerPanel(); } else if (name !== null) alert("表情名不能为空！"); }; event.target.value = null; });

        document.getElementById('upload-image-btn').addEventListener('click', () => document.getElementById('image-upload-input').click());
        document.getElementById('image-upload-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file || !state.activeChatId) return; const reader = new FileReader(); reader.onload = async (e) => { const base64Url = e.target.result; const chat = state.chats[state.activeChatId]; const msg = { role: 'user', content: [{ type: 'image_url', image_url: { url: base64Url } }], timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); }; reader.readAsDataURL(file); event.target.value = null; });
        document.getElementById('voice-message-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const text = await showCustomPrompt("发送语音", "请输入你想说的内容："); if (text && text.trim()) { const chat = state.chats[state.activeChatId]; const msg = { role: 'user', type: 'voice_message', content: text.trim(), timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); } });
        document.getElementById('send-photo-btn').addEventListener('click', async () => { if (!state.activeChatId) return; const description = await showCustomPrompt("发送照片", "请用文字描述您要发送的照片："); if (description && description.trim()) { const chat = state.chats[state.activeChatId]; const msg = { role: 'user', type: 'user_photo', content: description.trim(), timestamp: Date.now() }; chat.history.push(msg); await db.chats.put(chat); appendMessage(msg, chat); renderChatList(); } });

        // ▼▼▼ 【全新】外卖请求功能事件绑定 ▼▼▼
        const waimaiModal = document.getElementById('waimai-request-modal');
        document.getElementById('send-waimai-request-btn').addEventListener('click', () => {
            waimaiModal.classList.add('visible');
        });

        document.getElementById('waimai-cancel-btn').addEventListener('click', () => {
            waimaiModal.classList.remove('visible');
        });

        document.getElementById('waimai-confirm-btn').addEventListener('click', async () => {
            if (!state.activeChatId) return;

            const productInfoInput = document.getElementById('waimai-product-info');
            const amountInput = document.getElementById('waimai-amount');

            const productInfo = productInfoInput.value.trim();
            const amount = parseFloat(amountInput.value);

            if (!productInfo) {
                alert('请输入商品信息！');
                return;
            }
            if (isNaN(amount) || amount <= 0) {
                alert('请输入有效的代付金额！');
                return;
            }

            const chat = state.chats[state.activeChatId];
            const now = Date.now();

            // 【核心修正】在这里获取用户自己的昵称
            const myNickname = chat.isGroup ? (chat.settings.myNickname || '我') : '我';

            const msg = {
                role: 'user',
                // 【核心修正】将获取到的昵称，作为 senderName 添加到消息对象中
                senderName: myNickname,
                type: 'waimai_request',
                productInfo: productInfo,
                amount: amount,
                status: 'pending',
                countdownEndTime: now + 15 * 60 * 1000,
                timestamp: now
            };

            chat.history.push(msg);
            await db.chats.put(chat);
            appendMessage(msg, chat);
            renderChatList();

            productInfoInput.value = '';
            amountInput.value = '';
            waimaiModal.classList.remove('visible');
        });
        document.getElementById('open-persona-library-btn').addEventListener('click', openPersonaLibrary);
        document.getElementById('close-persona-library-btn').addEventListener('click', closePersonaLibrary);
        document.getElementById('add-persona-preset-btn').addEventListener('click', openPersonaEditorForCreate);
        document.getElementById('cancel-persona-editor-btn').addEventListener('click', closePersonaEditor);
        document.getElementById('save-persona-preset-btn').addEventListener('click', savePersonaPreset);
        document.getElementById('preset-action-edit').addEventListener('click', openPersonaEditorForEdit);
        document.getElementById('preset-action-delete').addEventListener('click', deletePersonaPreset);
        document.getElementById('preset-action-cancel').addEventListener('click', hidePresetActions);

        document.getElementById('selection-cancel-btn').addEventListener('click', exitSelectionMode);

        // ▼▼▼ 【最终加强版】用这块代码替换旧的 selection-delete-btn 事件监听器 ▼▼▼
        document.getElementById('selection-delete-btn').addEventListener('click', async () => {
            if (selectedMessages.size === 0) return;
            const confirmed = await showCustomConfirm('删除消息', `确定要删除选中的 ${selectedMessages.size} 条消息吗？这将改变AI的记忆。`, { confirmButtonClass: 'btn-danger' });
            if (confirmed) {
                const chat = state.chats[state.activeChatId];

                // 1. 【核心加强】在删除前，检查被删除的消息中是否包含投票
                let deletedPollsInfo = [];
                for (const timestamp of selectedMessages) {
                    const msg = chat.history.find(m => m.timestamp === timestamp);
                    if (msg && msg.type === 'poll') {
                        deletedPollsInfo.push(`关于“${msg.question}”的投票(时间戳: ${msg.timestamp})`);
                    }
                }

                // 2. 更新后端的历史记录
                chat.history = chat.history.filter(msg => !selectedMessages.has(msg.timestamp));

                // 3. 【核心加强】构建更具体的“遗忘指令”
                let forgetReason = "一些之前的消息已被用户删除。";
                if (deletedPollsInfo.length > 0) {
                    forgetReason += ` 其中包括以下投票：${deletedPollsInfo.join('；')}。`;
                }
                forgetReason += " 你应该像它们从未存在过一样继续对话，并相应地调整你的记忆和行为，不要再提及这些被删除的内容。";

                const forgetInstruction = {
                    role: 'system',
                    content: `[系统提示：${forgetReason}]`,
                    timestamp: Date.now(),
                    isHidden: true
                };
                chat.history.push(forgetInstruction);

                // 4. 将包含“遗忘指令”的、更新后的chat对象存回数据库
                await db.chats.put(chat);

                // 5. 最后才更新UI
                renderChatInterface(state.activeChatId);
                renderChatList();
            }
        });
        // ▲▲▲ 替换结束 ▲▲▲

        // 为聊天设置里的“更换头像框”按钮添加点击事件
        document.getElementById('chat-settings-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('change-frame-btn')) {
                // 'chat' 这个参数是告诉函数，这次是为“我/对方”这对组合更换头像框
                openFrameSelectorModal('chat');
            }
        });

        // 为成员设置里的“更换头像框”按钮添加点击事件
        document.getElementById('member-settings-modal').addEventListener('click', (e) => {
            // 【修正】将 .contents 修改为 .contains
            if (e.target.classList.contains('change-frame-btn')) {
                // 'member' 这个参数是告诉函数，这次是为单个群成员更换头像框
                openFrameSelectorModal('member');
            }
        });

        // ▲▲▲ 粘贴结束 ▲▲▲

        const fontUrlInput = document.getElementById('font-url-input');
        fontUrlInput.addEventListener('input', () => applyCustomFont(fontUrlInput.value.trim(), true));
        document.getElementById('save-font-btn').addEventListener('click', async () => {
            const newFontUrl = fontUrlInput.value.trim();
            if (!newFontUrl) { alert("请输入有效的字体URL。"); return; }
            applyCustomFont(newFontUrl, false);
            state.globalSettings.fontUrl = newFontUrl;
            await db.globalSettings.put(state.globalSettings);
            alert('字体已保存并应用！');
        });
        document.getElementById('reset-font-btn').addEventListener('click', resetToDefaultFont);

        document.querySelectorAll('#chat-list-bottom-nav .nav-item').forEach(item => { item.addEventListener('click', () => switchToChatListView(item.dataset.view)); });
        document.getElementById('qzone-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));
        document.getElementById('qzone-nickname').addEventListener('click', async () => { const newNickname = await showCustomPrompt("修改昵称", "请输入新的昵称", state.qzoneSettings.nickname); if (newNickname && newNickname.trim()) { state.qzoneSettings.nickname = newNickname.trim(); await saveQzoneSettings(); renderQzoneScreen(); } });
        document.getElementById('qzone-avatar-container').addEventListener('click', () => document.getElementById('qzone-avatar-input').click());
        document.getElementById('qzone-banner-container').addEventListener('click', () => document.getElementById('qzone-banner-input').click());
        document.getElementById('qzone-avatar-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise(res => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.readAsDataURL(file); }); state.qzoneSettings.avatar = dataUrl; await saveQzoneSettings(); renderQzoneScreen(); } event.target.value = null; });
        document.getElementById('qzone-banner-input').addEventListener('change', async (event) => { const file = event.target.files[0]; if (file) { const dataUrl = await new Promise(res => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.readAsDataURL(file); }); state.qzoneSettings.banner = dataUrl; await saveQzoneSettings(); renderQzoneScreen(); } event.target.value = null; });

        // ▼▼▼ 【修正后】的“说说”按钮事件 ▼▼▼
        document.getElementById('create-shuoshuo-btn').addEventListener('click', async () => {
            // 1. 重置并获取模态框
            resetCreatePostModal();
            const modal = document.getElementById('create-post-modal');

            // 2. 设置为“说说”模式
            modal.dataset.mode = 'shuoshuo';

            // 3. 隐藏与图片/文字图相关的部分
            modal.querySelector('.post-mode-switcher').style.display = 'none';
            modal.querySelector('#image-mode-content').style.display = 'none';
            modal.querySelector('#text-image-mode-content').style.display = 'none';

            // 4. 修改主输入框的提示语，使其更符合“说说”的场景
            modal.querySelector('#post-public-text').placeholder = '分享新鲜事...';

            // 5. 准备并显示模态框
            const visibilityGroupsContainer = document.getElementById('post-visibility-groups');
            visibilityGroupsContainer.innerHTML = '';
            const groups = await db.qzoneGroups.toArray();
            if (groups.length > 0) {
                groups.forEach(group => {
                    const label = document.createElement('label');
                    label.style.display = 'block';
                    label.innerHTML = `<input type="checkbox" name="visibility_group" value="${group.id}"> ${group.name}`;
                    visibilityGroupsContainer.appendChild(label);
                });
            } else {
                visibilityGroupsContainer.innerHTML = '<p style="color: var(--text-secondary);">没有可用的分组</p>';
            }
            modal.classList.add('visible');
        });

        // ▼▼▼ 【修正后】的“动态”（图片）按钮事件 ▼▼▼
        document.getElementById('create-post-btn').addEventListener('click', async () => {
            // 1. 重置并获取模态框
            resetCreatePostModal();
            const modal = document.getElementById('create-post-modal');

            // 2. 设置为“复杂动态”模式
            modal.dataset.mode = 'complex';

            // 3. 确保与图片/文字图相关的部分是可见的
            modal.querySelector('.post-mode-switcher').style.display = 'flex';
            // 显式激活“上传图片”模式...
            modal.querySelector('#image-mode-content').classList.add('active');
            // ...同时确保“文字图”模式是隐藏的
            modal.querySelector('#text-image-mode-content').classList.remove('active');

            // 4. 恢复主输入框的默认提示语
            modal.querySelector('#post-public-text').placeholder = '分享新鲜事...（非必填的公开文字）';

            // 5. 准备并显示模态框（与“说说”按钮的逻辑相同）
            const visibilityGroupsContainer = document.getElementById('post-visibility-groups');
            visibilityGroupsContainer.innerHTML = '';
            const groups = await db.qzoneGroups.toArray();
            if (groups.length > 0) {
                groups.forEach(group => {
                    const label = document.createElement('label');
                    label.style.display = 'block';
                    label.innerHTML = `<input type="checkbox" name="visibility_group" value="${group.id}"> ${group.name}`;
                    visibilityGroupsContainer.appendChild(label);
                });
            } else {
                visibilityGroupsContainer.innerHTML = '<p style="color: var(--text-secondary);">没有可用的分组</p>';
            }
            modal.classList.add('visible');
        });
        document.getElementById('open-album-btn').addEventListener('click', async () => { await renderAlbumList(); showScreen('album-screen'); });
        document.getElementById('album-back-btn').addEventListener('click', () => { showScreen('chat-list-screen'); switchToChatListView('qzone-screen'); });

        // --- ↓↓↓ 从这里开始复制 ↓↓↓ ---

        document.getElementById('album-photos-back-btn').addEventListener('click', () => {
            state.activeAlbumId = null;
            showScreen('album-screen');
        });

        document.getElementById('album-upload-photo-btn').addEventListener('click', () => document.getElementById('album-photo-input').click());

        document.getElementById('album-photo-input').addEventListener('change', async (event) => {
            if (!state.activeAlbumId) return;
            const files = event.target.files;
            if (!files.length) return;

            const album = await db.qzoneAlbums.get(state.activeAlbumId);

            for (const file of files) {
                const dataUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
                await db.qzonePhotos.add({ albumId: state.activeAlbumId, url: dataUrl, createdAt: Date.now() });
            }

            const photoCount = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).count();
            const updateData = { photoCount };

            if (!album.photoCount || album.coverUrl.includes('placeholder')) {
                const firstPhoto = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).first();
                if (firstPhoto) updateData.coverUrl = firstPhoto.url;
            }

            await db.qzoneAlbums.update(state.activeAlbumId, updateData);
            await renderAlbumPhotosScreen();
            await renderAlbumList();

            event.target.value = null;
            alert('照片上传成功！');
        });

        // --- ↑↑↑ 复制到这里结束 ↑↑↑ ---

        // --- ↓↓↓ 从这里开始复制，完整替换掉旧的 photos-grid-page 监听器 ↓↓↓ ---

        document.getElementById('photos-grid-page').addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.photo-delete-btn');
            const photoThumb = e.target.closest('.photo-thumb');

            if (deleteBtn) {
                e.stopPropagation(); // 阻止事件冒泡到图片上
                const photoId = parseInt(deleteBtn.dataset.photoId);
                const confirmed = await showCustomConfirm(
                    '删除照片',
                    '确定要删除这张照片吗？此操作不可恢复。',
                    { confirmButtonClass: 'btn-danger' }
                );

                if (confirmed) {
                    const deletedPhoto = await db.qzonePhotos.get(photoId);
                    if (!deletedPhoto) return;

                    await db.qzonePhotos.delete(photoId);

                    const album = await db.qzoneAlbums.get(state.activeAlbumId);
                    const photoCount = (album.photoCount || 1) - 1;
                    const updateData = { photoCount };

                    if (album.coverUrl === deletedPhoto.url) {
                        const nextPhoto = await db.qzonePhotos.where('albumId').equals(state.activeAlbumId).first();
                        updateData.coverUrl = nextPhoto ? nextPhoto.url : 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png';
                    }

                    await db.qzoneAlbums.update(state.activeAlbumId, updateData);
                    await renderAlbumPhotosScreen();
                    await renderAlbumList();
                    alert('照片已删除。');
                }
            }
            else if (photoThumb) {
                // 这就是恢复的图片点击放大功能！
                openPhotoViewer(photoThumb.src);
            }
        });

        // 恢复图片查看器的控制事件
        document.getElementById('photo-viewer-close-btn').addEventListener('click', closePhotoViewer);
        document.getElementById('photo-viewer-next-btn').addEventListener('click', showNextPhoto);
        document.getElementById('photo-viewer-prev-btn').addEventListener('click', showPrevPhoto);

        // 恢复键盘左右箭头和ESC键的功能
        document.addEventListener('keydown', (e) => {
            if (!photoViewerState.isOpen) return;

            if (e.key === 'ArrowRight') {
                showNextPhoto();
            } else if (e.key === 'ArrowLeft') {
                showPrevPhoto();
            } else if (e.key === 'Escape') {
                closePhotoViewer();
            }
        });

        // --- ↑↑↑ 复制到这里结束 ↑↑↑ ---

        document.getElementById('create-album-btn-page').addEventListener('click', async () => { const albumName = await showCustomPrompt("创建新相册", "请输入相册名称"); if (albumName && albumName.trim()) { const newAlbum = { name: albumName.trim(), coverUrl: 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png', photoCount: 0, createdAt: Date.now() }; await db.qzoneAlbums.add(newAlbum); await renderAlbumList(); alert(`相册 "${albumName}" 创建成功！`); } else if (albumName !== null) { alert("相册名称不能为空！"); } });

        document.getElementById('cancel-create-post-btn').addEventListener('click', () => document.getElementById('create-post-modal').classList.remove('visible'));
        document.getElementById('post-upload-local-btn').addEventListener('click', () => document.getElementById('post-local-image-input').click());
        document.getElementById('post-local-image-input').addEventListener('change', (event) => { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => { document.getElementById('post-image-preview').src = e.target.result; document.getElementById('post-image-preview-container').classList.add('visible'); document.getElementById('post-image-desc-group').style.display = 'block'; }; reader.readAsDataURL(file); } });
        document.getElementById('post-use-url-btn').addEventListener('click', async () => { const url = await showCustomPrompt("输入图片URL", "请输入网络图片的链接", "", "url"); if (url) { document.getElementById('post-image-preview').src = url; document.getElementById('post-image-preview-container').classList.add('visible'); document.getElementById('post-image-desc-group').style.display = 'block'; } });
        document.getElementById('post-remove-image-btn').addEventListener('click', () => resetCreatePostModal());
        const imageModeBtn = document.getElementById('switch-to-image-mode');
        const textImageModeBtn = document.getElementById('switch-to-text-image-mode');
        const imageModeContent = document.getElementById('image-mode-content');
        const textImageModeContent = document.getElementById('text-image-mode-content');
        imageModeBtn.addEventListener('click', () => { imageModeBtn.classList.add('active'); textImageModeBtn.classList.remove('active'); imageModeContent.classList.add('active'); textImageModeContent.classList.remove('active'); });
        textImageModeBtn.addEventListener('click', () => { textImageModeBtn.classList.add('active'); imageModeBtn.classList.remove('active'); textImageModeContent.classList.add('active'); imageModeContent.classList.remove('active'); });

        // ▼▼▼ 【最终修正版】的“发布”按钮事件，已修复权限漏洞 ▼▼▼
        document.getElementById('confirm-create-post-btn').addEventListener('click', async () => {
            const modal = document.getElementById('create-post-modal');
            const mode = modal.dataset.mode;

            // --- 1. 获取通用的可见性设置 ---
            const visibilityMode = document.querySelector('input[name="visibility"]:checked').value;
            let visibleGroupIds = null;

            if (visibilityMode === 'include') {
                visibleGroupIds = Array.from(document.querySelectorAll('input[name="visibility_group"]:checked')).map(cb => parseInt(cb.value));
            }

            let newPost = {};
            const basePostData = {
                timestamp: Date.now(),
                authorId: 'user',
                // 【重要】在这里就把权限信息存好
                visibleGroupIds: visibleGroupIds,
            };

            // --- 2. 根据模式构建不同的 post 对象 ---
            if (mode === 'shuoshuo') {
                const content = document.getElementById('post-public-text').value.trim();
                if (!content) {
                    alert('说说内容不能为空哦！');
                    return;
                }
                newPost = {
                    ...basePostData,
                    type: 'shuoshuo',
                    content: content,
                };

            } else { // 处理 'complex' 模式 (图片/文字图)
                const publicText = document.getElementById('post-public-text').value.trim();
                const isImageModeActive = document.getElementById('image-mode-content').classList.contains('active');

                if (isImageModeActive) {
                    const imageUrl = document.getElementById('post-image-preview').src;
                    const imageDescription = document.getElementById('post-image-description').value.trim();
                    if (!imageUrl || !(imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
                        alert('请先添加一张图片再发布动态哦！');
                        return;
                    }
                    if (!imageDescription) {
                        alert('请为你的图片添加一个简单的描述（必填，给AI看的）！');
                        return;
                    }
                    newPost = {
                        ...basePostData,
                        type: 'image_post',
                        publicText: publicText,
                        imageUrl: imageUrl,
                        imageDescription: imageDescription,
                    };
                } else { // 文字图模式
                    const hiddenText = document.getElementById('post-hidden-text').value.trim();
                    if (!hiddenText) {
                        alert('请输入文字图描述！');
                        return;
                    }
                    newPost = {
                        ...basePostData,
                        type: 'text_image',
                        publicText: publicText,
                        hiddenContent: hiddenText,
                    };
                }
            }

            // --- 3. 保存到数据库 ---
            const newPostId = await db.qzonePosts.add(newPost);
            let postSummary = newPost.content || newPost.publicText || newPost.imageDescription || newPost.hiddenContent || "（无文字内容）";
            postSummary = postSummary.substring(0, 50) + (postSummary.length > 50 ? '...' : '');

            // --- 4. 【核心修正】带有权限检查的通知循环 ---
            for (const chatId in state.chats) {
                const chat = state.chats[chatId];
                if (chat.isGroup) continue; // 跳过群聊

                let shouldNotify = false;
                const postVisibleGroups = newPost.visibleGroupIds;

                // 判断条件1：如果动态是公开的 (没有设置任何可见分组)
                if (!postVisibleGroups || postVisibleGroups.length === 0) {
                    shouldNotify = true;
                }
                // 判断条件2：如果动态设置了部分可见，并且当前角色在可见分组内
                else if (chat.groupId && postVisibleGroups.includes(chat.groupId)) {
                    shouldNotify = true;
                }

                // 只有满足条件的角色才会被通知
                if (shouldNotify) {
                    const historyMessage = {
                        role: 'system',
                        content: `[系统提示：用户刚刚发布了一条动态(ID: ${newPostId})，内容摘要是：“${postSummary}”。你现在可以对这条动态进行评论了。]`,
                        timestamp: Date.now(),
                        isHidden: true
                    };
                    chat.history.push(historyMessage);
                    await db.chats.put(chat);
                }
            }
            // --- 修正结束 ---

            await renderQzonePosts();
            modal.classList.remove('visible');
            alert('动态发布成功！');
        });

        // ▼▼▼ 请用这【一整块】包含所有滑动和点击事件的完整代码，替换掉旧的 postsList 事件监听器 ▼▼▼

        const postsList = document.getElementById('qzone-posts-list');
        let swipeState = { isDragging: false, startX: 0, startY: 0, currentX: 0, activeContainer: null, swipeDirection: null, isClick: true };

        function resetAllSwipes(exceptThisOne = null) {
            document.querySelectorAll('.qzone-post-container').forEach(container => {
                if (container !== exceptThisOne) {
                    container.querySelector('.qzone-post-item').classList.remove('swiped');
                }
            });
        }

        const handleSwipeStart = (e) => {
            const targetContainer = e.target.closest('.qzone-post-container');
            if (!targetContainer) return;

            resetAllSwipes(targetContainer);
            swipeState.activeContainer = targetContainer;
            swipeState.isDragging = true;
            swipeState.isClick = true;
            swipeState.swipeDirection = null;
            swipeState.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            swipeState.startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
            swipeState.activeContainer.querySelector('.qzone-post-item').style.transition = 'none';
        };

        const handleSwipeMove = (e) => {
            if (!swipeState.isDragging || !swipeState.activeContainer) return;

            const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
            const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
            const diffX = currentX - swipeState.startX;
            const diffY = currentY - swipeState.startY;
            const absDiffX = Math.abs(diffX);
            const absDiffY = Math.abs(diffY);
            const clickThreshold = 5;

            if (absDiffX > clickThreshold || absDiffY > clickThreshold) {
                swipeState.isClick = false;
            }

            if (swipeState.swipeDirection === null) {
                if (absDiffX > clickThreshold || absDiffY > clickThreshold) {
                    if (absDiffX > absDiffY) {
                        swipeState.swipeDirection = 'horizontal';
                    } else {
                        swipeState.swipeDirection = 'vertical';
                    }
                }
            }
            if (swipeState.swipeDirection === 'vertical') {
                handleSwipeEnd(e);
                return;
            }
            if (swipeState.swipeDirection === 'horizontal') {
                e.preventDefault();
                swipeState.currentX = currentX;
                let translation = diffX;
                if (translation > 0) translation = 0;
                if (translation < -90) translation = -90;
                swipeState.activeContainer.querySelector('.qzone-post-item').style.transform = `translateX(${translation}px)`;
            }
        };

        const handleSwipeEnd = (e) => {
            if (swipeState.isClick) {
                swipeState.isDragging = false;
                swipeState.activeContainer = null;
                return;
            }
            if (!swipeState.isDragging || !swipeState.activeContainer) return;

            const postItem = swipeState.activeContainer.querySelector('.qzone-post-item');
            postItem.style.transition = 'transform 0.3s ease';

            const finalX = e.type.includes('touchend') ? e.changedTouches[0].pageX : e.pageX;
            const diffX = finalX - swipeState.startX;
            const swipeThreshold = -40;

            if (swipeState.swipeDirection === 'horizontal' && diffX < swipeThreshold) {
                postItem.classList.add('swiped');
                postItem.style.transform = '';
            } else {
                postItem.classList.remove('swiped');
                postItem.style.transform = '';
            }

            swipeState.isDragging = false;
            swipeState.startX = 0;
            swipeState.startY = 0;
            swipeState.currentX = 0;
            swipeState.activeContainer = null;
            swipeState.swipeDirection = null;
            swipeState.isClick = true;
        };

        // --- 绑定所有滑动事件 ---
        postsList.addEventListener('mousedown', handleSwipeStart);
        document.addEventListener('mousemove', handleSwipeMove);
        document.addEventListener('mouseup', handleSwipeEnd);
        postsList.addEventListener('touchstart', handleSwipeStart, { passive: false });
        postsList.addEventListener('touchmove', handleSwipeMove, { passive: false });
        postsList.addEventListener('touchend', handleSwipeEnd);

        // --- 绑定所有点击事件 ---
        postsList.addEventListener('click', async (e) => {
            e.stopPropagation();
            const target = e.target;

            if (target.classList.contains('post-actions-btn')) {
                const container = target.closest('.qzone-post-container');
                if (container && container.dataset.postId) {
                    showPostActions(parseInt(container.dataset.postId));
                }
                return;
            }

            if (target.closest('.qzone-post-delete-action')) {
                const container = target.closest('.qzone-post-container');
                if (!container) return;

                const postIdToDelete = parseInt(container.dataset.postId);
                if (isNaN(postIdToDelete)) return;

                const confirmed = await showCustomConfirm('删除动态', '确定要永久删除这条动态吗？', { confirmButtonClass: 'btn-danger' });

                if (confirmed) {
                    container.style.transition = 'all 0.3s ease';
                    container.style.transform = 'scale(0.8)';
                    container.style.opacity = '0';

                    setTimeout(async () => {
                        await db.qzonePosts.delete(postIdToDelete);

                        const notificationIdentifier = `(ID: ${postIdToDelete})`;
                        for (const chatId in state.chats) {
                            const chat = state.chats[chatId];
                            const originalHistoryLength = chat.history.length;
                            chat.history = chat.history.filter(msg => !(msg.role === 'system' && msg.content.includes(notificationIdentifier)));
                            if (chat.history.length < originalHistoryLength) {
                                await db.chats.put(chat);
                            }
                        }
                        await renderQzonePosts();
                        alert('动态已删除。');
                    }, 300);
                }
                return;
            }

            if (target.tagName === 'IMG' && target.dataset.hiddenText) {
                const hiddenText = target.dataset.hiddenText;
                showCustomAlert("图片内容", hiddenText.replace(/<br>/g, '\n'));
                return;
            }
            const icon = target.closest('.action-icon');
            if (icon) {
                const postContainer = icon.closest('.qzone-post-container');
                if (!postContainer) return;
                const postId = parseInt(postContainer.dataset.postId);
                if (isNaN(postId)) return;
                if (icon.classList.contains('like')) {
                    const post = await db.qzonePosts.get(postId);
                    if (!post) return;
                    if (!post.likes) post.likes = [];
                    const userNickname = state.qzoneSettings.nickname;
                    const userLikeIndex = post.likes.indexOf(userNickname);
                    if (userLikeIndex > -1) {
                        post.likes.splice(userLikeIndex, 1);
                    } else {
                        post.likes.push(userNickname);
                        icon.classList.add('animate-like');
                        icon.addEventListener('animationend', () => icon.classList.remove('animate-like'), { once: true });
                    }
                    await db.qzonePosts.update(postId, { likes: post.likes });
                }
                if (icon.classList.contains('favorite')) {
                    const existingFavorite = await db.favorites.where({ type: 'qzone_post', 'content.id': postId }).first();
                    if (existingFavorite) {
                        await db.favorites.delete(existingFavorite.id);
                        await showCustomAlert('提示', '已取消收藏');
                    } else {
                        const postToSave = await db.qzonePosts.get(postId);
                        if (postToSave) {
                            await db.favorites.add({ type: 'qzone_post', content: postToSave, timestamp: Date.now() });
                            await showCustomAlert('提示', '收藏成功！');
                        }
                    }
                }
                await renderQzonePosts();
                return;
            }
            const sendBtn = target.closest('.comment-send-btn');
            if (sendBtn) {
                const postContainer = sendBtn.closest('.qzone-post-container');
                if (!postContainer) return;
                const postId = parseInt(postContainer.dataset.postId);
                const commentInput = postContainer.querySelector('.comment-input');
                const commentText = commentInput.value.trim();
                if (!commentText) return alert('评论内容不能为空哦！');
                const post = await db.qzonePosts.get(postId);
                if (!post) return;
                if (!post.comments) post.comments = [];
                post.comments.push({ commenterName: state.qzoneSettings.nickname, text: commentText, timestamp: Date.now() });
                await db.qzonePosts.update(postId, { comments: post.comments });
                for (const chatId in state.chats) {
                    const chat = state.chats[chatId];
                    if (!chat.isGroup) {
                        chat.history.push({ role: 'system', content: `[系统提示：'${state.qzoneSettings.nickname}' 在ID为${postId}的动态下发表了评论：“${commentText}”]`, timestamp: Date.now(), isHidden: true });
                        await db.chats.put(chat);
                    }
                }
                commentInput.value = '';
                await renderQzonePosts();
                return;
            }
        });
        // ▲▲▲ 替换结束 ▲▲▲

        // ▼▼▼ 在 init() 函数的事件监听器区域，粘贴下面这两行 ▼▼▼

        // 绑定动态页和收藏页的返回按钮
        document.getElementById('qzone-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));
        document.getElementById('favorites-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));

        // ▲▲▲ 添加结束 ▲▲▲

        // ▼▼▼ 在 init() 函数的事件监听器区域，检查并确保你有这段完整的代码 ▼▼▼

        // 收藏页搜索功能
        const searchInput = document.getElementById('favorites-search-input');
        const searchClearBtn = document.getElementById('favorites-search-clear-btn');

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim().toLowerCase();

            // 控制清除按钮的显示/隐藏
            searchClearBtn.style.display = searchTerm ? 'block' : 'none';

            if (!searchTerm) {
                displayFilteredFavorites(allFavoriteItems); // 如果搜索框为空，显示所有
                return;
            }

            // 筛选逻辑
            const filteredItems = allFavoriteItems.filter(item => {
                let contentToSearch = '';
                let authorToSearch = '';

                if (item.type === 'qzone_post') {
                    const post = item.content;
                    contentToSearch += (post.publicText || '') + ' ' + (post.content || '');
                    if (post.authorId === 'user') {
                        authorToSearch = state.qzoneSettings.nickname;
                    } else if (state.chats[post.authorId]) {
                        authorToSearch = state.chats[post.authorId].name;
                    }
                } else if (item.type === 'chat_message') {
                    const msg = item.content;
                    if (typeof msg.content === 'string') {
                        contentToSearch = msg.content;
                    }
                    const chat = state.chats[item.chatId];
                    if (chat) {
                        if (msg.role === 'user') {
                            authorToSearch = chat.isGroup ? (chat.settings.myNickname || '我') : '我';
                        } else {
                            authorToSearch = chat.isGroup ? msg.senderName : chat.name;
                        }
                    }
                }

                // 同时搜索内容和作者，并且不区分大小写
                return contentToSearch.toLowerCase().includes(searchTerm) ||
                    authorToSearch.toLowerCase().includes(searchTerm);
            });

            displayFilteredFavorites(filteredItems);
        });

        // 清除按钮的点击事件
        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchClearBtn.style.display = 'none';
            displayFilteredFavorites(allFavoriteItems);
            searchInput.focus();
        });

        // ▲▲▲ 代码检查结束 ▲▲▲

        // ▼▼▼ 新增/修改的事件监听器 ▼▼▼

        // 为聊天界面的批量收藏按钮绑定事件
        // 为聊天界面的批量收藏按钮绑定事件 (已修正)
        document.getElementById('selection-favorite-btn').addEventListener('click', async () => {
            if (selectedMessages.size === 0) return;
            const chat = state.chats[state.activeChatId];
            if (!chat) return;

            const favoritesToAdd = [];
            const timestampsToFavorite = [...selectedMessages];

            for (const timestamp of timestampsToFavorite) {
                // 【核心修正1】使用新的、高效的索引进行查询
                const existing = await db.favorites.where('originalTimestamp').equals(timestamp).first();

                if (!existing) {
                    const messageToSave = chat.history.find(msg => msg.timestamp === timestamp);
                    if (messageToSave) {
                        favoritesToAdd.push({
                            type: 'chat_message',
                            content: messageToSave,
                            chatId: state.activeChatId,
                            timestamp: Date.now(), // 这是收藏操作发生的时间
                            originalTimestamp: messageToSave.timestamp // 【核心修正2】保存原始消息的时间戳到新字段
                        });
                    }
                }
            }

            if (favoritesToAdd.length > 0) {
                await db.favorites.bulkAdd(favoritesToAdd);
                allFavoriteItems = await db.favorites.orderBy('timestamp').reverse().toArray(); // 更新全局收藏缓存
                await showCustomAlert('收藏成功', `已成功收藏 ${favoritesToAdd.length} 条消息。`);
            } else {
                await showCustomAlert('提示', '选中的消息均已收藏过。');
            }

            exitSelectionMode();
        });

        // 收藏页面的"编辑"按钮事件 (已修正)
        const favoritesEditBtn = document.getElementById('favorites-edit-btn');
        const favoritesView = document.getElementById('favorites-view');
        const favoritesActionBar = document.getElementById('favorites-action-bar');
        const mainBottomNav = document.getElementById('chat-list-bottom-nav'); // 获取主导航栏
        const favoritesList = document.getElementById('favorites-list'); // 获取收藏列表

        favoritesEditBtn.addEventListener('click', () => {
            isFavoritesSelectionMode = !isFavoritesSelectionMode;
            favoritesView.classList.toggle('selection-mode', isFavoritesSelectionMode);

            if (isFavoritesSelectionMode) {
                // --- 进入编辑模式 ---
                favoritesEditBtn.textContent = '完成';
                favoritesActionBar.style.display = 'block'; // 显示删除操作栏
                mainBottomNav.style.display = 'none'; // ▼ 新增：隐藏主导航栏
                favoritesList.style.paddingBottom = '80px'; // ▼ 新增：给列表底部增加空间
            } else {
                // --- 退出编辑模式 ---
                favoritesEditBtn.textContent = '编辑';
                favoritesActionBar.style.display = 'none'; // 隐藏删除操作栏
                mainBottomNav.style.display = 'flex';  // ▼ 新增：恢复主导航栏
                favoritesList.style.paddingBottom = ''; // ▼ 新增：恢复列表默认padding

                // 退出时清空所有选择
                selectedFavorites.clear();
                document.querySelectorAll('.favorite-item-card.selected').forEach(card => card.classList.remove('selected'));
                document.getElementById('favorites-delete-selected-btn').textContent = `删除 (0)`;
            }
        });

        // ▼▼▼ 将它【完整替换】为下面这段修正后的代码 ▼▼▼
        // 收藏列表的点击选择事件 (事件委托)
        document.getElementById('favorites-list').addEventListener('click', (e) => {
            const target = e.target;
            const card = target.closest('.favorite-item-card');

            // 【新增】处理文字图点击，这段逻辑要放在最前面，保证任何模式下都生效
            if (target.tagName === 'IMG' && target.dataset.hiddenText) {
                const hiddenText = target.dataset.hiddenText;
                showCustomAlert("图片内容", hiddenText.replace(/<br>/g, '\n'));
                return; // 处理完就退出，不继续执行选择逻辑
            }

            // 如果不在选择模式，则不执行后续的选择操作
            if (!isFavoritesSelectionMode) return;

            // --- 以下是原有的选择逻辑，保持不变 ---
            if (!card) return;

            const favId = parseInt(card.dataset.favid);
            if (isNaN(favId)) return;

            // 切换选择状态
            if (selectedFavorites.has(favId)) {
                selectedFavorites.delete(favId);
                card.classList.remove('selected');
            } else {
                selectedFavorites.add(favId);
                card.classList.add('selected');
            }

            // 更新底部删除按钮的计数
            document.getElementById('favorites-delete-selected-btn').textContent = `删除 (${selectedFavorites.size})`;
        });

        // ▼▼▼ 将它【完整替换】为下面这段修正后的代码 ▼▼▼
        // 收藏页面批量删除按钮事件
        document.getElementById('favorites-delete-selected-btn').addEventListener('click', async () => {
            if (selectedFavorites.size === 0) return;

            const confirmed = await showCustomConfirm(
                '确认删除',
                `确定要从收藏夹中移除这 ${selectedFavorites.size} 条内容吗？`,
                { confirmButtonClass: 'btn-danger' }
            );

            if (confirmed) {
                const idsToDelete = [...selectedFavorites];
                await db.favorites.bulkDelete(idsToDelete);
                await showCustomAlert('删除成功', '选中的收藏已被移除。');

                // 【核心修正1】从前端缓存中也移除被删除的项
                allFavoriteItems = allFavoriteItems.filter(item => !idsToDelete.includes(item.id));

                // 【核心修正2】使用更新后的缓存，立即重新渲染列表
                displayFilteredFavorites(allFavoriteItems);

                // 最后，再退出编辑模式
                favoritesEditBtn.click(); // 模拟点击"完成"按钮来退出编辑模式
            }
        });

        // ▼▼▼ 在 init() 函数末尾添加 ▼▼▼
        if (state.globalSettings.enableBackgroundActivity) {
            startBackgroundSimulation();
            console.log("后台活动模拟已自动启动。");
        }
        // ▲▲▲ 添加结束 ▲▲▲

        // ▼▼▼ 【这是最终的正确代码】请粘贴这段代码到 init() 的事件监听器区域末尾 ▼▼▼

        // --- 统一处理所有影响预览的控件的事件 ---

        // 1. 监听主题选择
        document.querySelectorAll('input[name="theme-select"]').forEach(radio => {
            radio.addEventListener('change', updateSettingsPreview);
        });

        // 2. 监听字体大小滑块
        const fontSizeSlider = document.getElementById('font-size-slider');
        fontSizeSlider.addEventListener('input', () => {
            // a. 实时更新数值显示
            document.getElementById('font-size-value').textContent = `${fontSizeSlider.value}px`;
            // b. 更新预览
            updateSettingsPreview();
        });

        // 3. 监听自定义CSS输入框
        const customCssInputForPreview = document.getElementById('custom-css-input');
        customCssInputForPreview.addEventListener('input', updateSettingsPreview);

        // 4. 监听重置按钮
        document.getElementById('reset-theme-btn').addEventListener('click', () => {
            document.getElementById('theme-default').checked = true;
            updateSettingsPreview();
        });

        document.getElementById('reset-custom-css-btn').addEventListener('click', () => {
            document.getElementById('custom-css-input').value = '';
            updateSettingsPreview();
        });

        // ▲▲▲ 粘贴结束 ▲▲▲

        // ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
        document.querySelectorAll('input[name="visibility"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const groupsContainer = document.getElementById('post-visibility-groups');
                if (this.value === 'include' || this.value === 'exclude') {
                    groupsContainer.style.display = 'block';
                } else {
                    groupsContainer.style.display = 'none';
                }
            });
        });
        // ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
        document.getElementById('manage-groups-btn').addEventListener('click', openGroupManager);
        document.getElementById('close-group-manager-btn').addEventListener('click', () => {
            document.getElementById('group-management-modal').classList.remove('visible');
            // 刷新聊天设置里的分组列表
            const chatSettingsBtn = document.getElementById('chat-settings-btn');
            if (document.getElementById('chat-settings-modal').classList.contains('visible')) {
                chatSettingsBtn.click(); // 再次点击以重新打开
            }
        });

        document.getElementById('add-new-group-btn').addEventListener('click', addNewGroup);
        document.getElementById('existing-groups-list').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-group-btn')) {
                const groupId = parseInt(e.target.dataset.id);
                deleteGroup(groupId);
            }
        });
        // ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ▼▼▼ 请将这段【新代码】粘贴到 init() 的事件监听器区域末尾 ▼▼▼
        // 消息操作菜单的按钮事件
        document.getElementById('cancel-message-action-btn').addEventListener('click', hideMessageActions);
        // ▼▼▼ 【修正】使用新的编辑器入口 ▼▼▼
        document.getElementById('edit-message-btn').addEventListener('click', openAdvancedMessageEditor);
        // ▲▲▲ 替换结束 ▲▲▲
        document.getElementById('copy-message-btn').addEventListener('click', copyMessageContent);

        // ▼▼▼ 请用这段【修正后】的代码替换旧的 select-message-btn 事件监听器 ▼▼▼
        document.getElementById('select-message-btn').addEventListener('click', () => {
            // 【核心修复】在关闭菜单前，先捕获时间戳
            const timestampToSelect = activeMessageTimestamp;
            hideMessageActions();
            // 使用捕获到的值
            if (timestampToSelect) {
                enterSelectionMode(timestampToSelect);
            }
        });
        // ▲▲▲ 替换结束 ▲▲▲

        // ▼▼▼ 在 init() 函数的事件监听器区域末尾添加 ▼▼▼

        // 动态操作菜单的按钮事件
        document.getElementById('edit-post-btn').addEventListener('click', openPostEditor);
        document.getElementById('copy-post-btn').addEventListener('click', copyPostContent);
        document.getElementById('cancel-post-action-btn').addEventListener('click', hidePostActions);

        // ▲▲▲ 添加结束 ▲▲▲

        // ▼▼▼ 将这段【失踪】的事件监听代码，粘贴到 init() 函数的事件监听器区域末尾 ▼▼▼

        // 头像框选择模态框的按钮事件
        document.getElementById('save-frame-settings-btn').addEventListener('click', saveSelectedFrames);
        document.getElementById('cancel-frame-settings-btn').addEventListener('click', () => {
            frameModal.classList.remove('visible');
            editingFrameForMember = false; // 确保重置状态
        });

        // 头像框 Tab 切换事件
        aiFrameTab.addEventListener('click', () => {
            aiFrameTab.classList.add('active');
            myFrameTab.classList.remove('active');
            aiFrameContent.style.display = 'block';
            myFrameContent.style.display = 'none';
        });
        myFrameTab.addEventListener('click', () => {
            myFrameTab.classList.add('active');
            aiFrameTab.classList.remove('active');
            myFrameContent.style.display = 'block';
            aiFrameContent.style.display = 'none';
        });

        // ▲▲▲ 修复代码粘贴结束 ▲▲▲

        // ▼▼▼ 【新增】联系人选择器事件绑定 ▼▼▼
        document.getElementById('cancel-contact-picker-btn').addEventListener('click', () => {
            showScreen('chat-list-screen');
        });

        document.getElementById('contact-picker-list').addEventListener('click', (e) => {
            const item = e.target.closest('.contact-picker-item');
            if (!item) return;

            const contactId = item.dataset.contactId;
            item.classList.toggle('selected');

            if (selectedContacts.has(contactId)) {
                selectedContacts.delete(contactId);
            } else {
                selectedContacts.add(contactId);
            }
            updateContactPickerConfirmButton();
        });

        // ▼▼▼ 【新增】绑定“管理群成员”按钮事件 ▼▼▼
        document.getElementById('manage-members-btn').addEventListener('click', () => {
            // 在切换屏幕前，先隐藏当前的聊天设置弹窗
            document.getElementById('chat-settings-modal').classList.remove('visible');
            // 然后再打开成员管理屏幕
            openMemberManagementScreen();
        });
        // ▲▲▲ 新增代码结束 ▲▲▲

        // ▼▼▼ 【最终完整版】群成员管理功能事件绑定 ▼▼▼
        document.getElementById('back-from-member-management').addEventListener('click', () => {

            showScreen('chat-interface-screen');
            document.getElementById('chat-settings-btn').click();
        });
        // ▲▲▲ 替换结束 ▲▲▲

        document.getElementById('member-management-list').addEventListener('click', (e) => {
            // 【已恢复】移除成员的事件
            if (e.target.classList.contains('remove-member-btn')) {
                removeMemberFromGroup(e.target.dataset.memberId);
            }
        });

        document.getElementById('add-existing-contact-btn').addEventListener('click', async () => {
            // 【已恢复】从好友列表添加的事件
            // 【关键】为“完成”按钮绑定“拉人入群”的逻辑
            const confirmBtn = document.getElementById('confirm-contact-picker-btn');
            // 使用克隆节点方法清除旧的事件监听器，防止重复绑定
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            newConfirmBtn.addEventListener('click', handleAddMembersToGroup);

            await openContactPickerForAddMember();
        });

        document.getElementById('create-new-member-btn').addEventListener('click', createNewMemberInGroup);
        // ▲▲▲ 替换结束 ▲▲▲

        // ▼▼▼ 【全新】视频通话功能事件监听器 ▼▼▼

        // 绑定单聊和群聊的发起按钮
        document.getElementById('video-call-btn').addEventListener('click', handleInitiateCall);
        document.getElementById('group-video-call-btn').addEventListener('click', handleInitiateCall);

        // 绑定“挂断”按钮
        document.getElementById('hang-up-btn').addEventListener('click', endVideoCall);

        // 绑定“取消呼叫”按钮
        document.getElementById('cancel-call-btn').addEventListener('click', () => {
            videoCallState.isAwaitingResponse = false;
            showScreen('chat-interface-screen');
        });

        // 【全新】绑定“加入通话”按钮
        document.getElementById('join-call-btn').addEventListener('click', handleUserJoinCall);

        // ▼▼▼ 用这个【已修复并激活旁观模式】的版本替换旧的 decline-call-btn 事件监听器 ▼▼▼
        // 绑定来电请求的“拒绝”按钮
        document.getElementById('decline-call-btn').addEventListener('click', async () => {
            hideIncomingCallModal();
            const chat = state.chats[videoCallState.activeChatId];
            if (!chat) return;

            // 【核心修正】在这里，我们将拒绝的逻辑与API调用连接起来
            if (videoCallState.isGroupCall) {
                videoCallState.isUserParticipating = false; // 标记用户为旁观者

                // 1. 创建一条隐藏消息，通知AI用户拒绝了
                const systemNote = {
                    role: 'system',
                    content: `[系统提示：用户拒绝了通话邀请，但你们可以自己开始。请你们各自决策是否加入。]`,
                    timestamp: Date.now(),
                    isHidden: true
                };
                chat.history.push(systemNote);
                await db.chats.put(chat);

                // 2. 【关键】触发AI响应，让它们自己决定要不要开始群聊
                // 这将会在后台处理，如果AI们决定开始，最终会调用 startVideoCall()
                await triggerAiResponse();

            } else { // 单聊拒绝逻辑保持不变
                const declineMessage = { role: 'user', content: '我拒绝了你的视频通话请求。', timestamp: Date.now() };
                chat.history.push(declineMessage);
                await db.chats.put(chat);

                // 回到聊天界面并显示拒绝消息
                showScreen('chat-interface-screen');
                appendMessage(declineMessage, chat);

                // 让AI对你的拒绝做出回应
                triggerAiResponse();
            }

            // 清理状态，以防万一
            videoCallState.isAwaitingResponse = false;
        });
        // ▲▲▲ 替换结束 ▲▲▲

        // ▼▼▼ 用这个【已修复重复头像BUG】的版本替换旧的 accept-call-btn 事件监听器 ▼▼▼
        // 绑定来电请求的“接听”按钮
        document.getElementById('accept-call-btn').addEventListener('click', async () => {
            hideIncomingCallModal();

            videoCallState.initiator = 'ai';
            videoCallState.isUserParticipating = true;
            videoCallState.activeChatId = state.activeChatId;

            // 【核心修正】我们在这里不再手动添加用户到 participants 列表
            if (videoCallState.isGroupCall) {
                // 对于群聊，我们只把【发起通话的AI】加入参与者列表
                const chat = state.chats[videoCallState.activeChatId];
                const requester = chat.members.find(m => m.name === videoCallState.callRequester);
                if (requester) {
                    // 清空可能存在的旧数据，然后只添加发起者
                    videoCallState.participants = [requester];
                } else {
                    videoCallState.participants = []; // 如果找不到发起者，就清空
                }
            }

            // 无论单聊还是群聊，直接启动通话界面！
            startVideoCall();
        });
        // ▲▲▲ 替换结束 ▲▲▲


        // ▼▼▼ 请用这个【已增加用户高亮】的全新版本，完整替换旧的 user-speak-btn 事件监听器 ▼▼▼
        // 绑定用户在通话中发言的按钮
        document.getElementById('user-speak-btn').addEventListener('click', async () => {
            if (!videoCallState.isActive) return;

            // ★★★★★ 核心新增：在弹出输入框前，先找到并高亮用户头像 ★★★★★
            const userAvatar = document.querySelector('.participant-avatar-wrapper[data-participant-id="user"] .participant-avatar');
            if (userAvatar) {
                userAvatar.classList.add('speaking');
            }

            const userInput = await showCustomPrompt('你说', '请输入你想说的话...');

            // ★★★★★ 核心新增：无论用户是否输入，只要关闭输入框就移除高亮 ★★★★★
            if (userAvatar) {
                userAvatar.classList.remove('speaking');
            }

            if (userInput && userInput.trim()) {
                triggerAiInCallAction(userInput.trim());
            }
        });
        // ▲▲▲ 替换结束 ▲▲▲

        // ▼▼▼ 【新增】回忆录相关事件绑定 ▼▼▼
        // 1. 将“回忆”页签和它的视图连接起来
        document.querySelector('.nav-item[data-view="memories-view"]').addEventListener('click', () => {
            // 在切换前，确保"收藏"页面的编辑模式已关闭
            if (isFavoritesSelectionMode) {
                document.getElementById('favorites-edit-btn').click();
            }
            switchToChatListView('memories-view');
            renderMemoriesScreen(); // 点击时渲染
        });

        // 2. 绑定回忆录界面的返回按钮
        document.getElementById('memories-back-btn').addEventListener('click', () => switchToChatListView('messages-view'));

        // ▲▲▲ 新增结束 ▲▲▲

        // 【全新】约定/倒计时功能事件绑定
        document.getElementById('add-countdown-btn').addEventListener('click', () => {
            document.getElementById('create-countdown-modal').classList.add('visible');
        });
        document.getElementById('cancel-create-countdown-btn').addEventListener('click', () => {
            document.getElementById('create-countdown-modal').classList.remove('visible');
        });
        document.getElementById('confirm-create-countdown-btn').addEventListener('click', async () => {
            const title = document.getElementById('countdown-title-input').value.trim();
            const dateValue = document.getElementById('countdown-date-input').value;

            if (!title || !dateValue) {
                alert('请填写完整的约定标题和日期！');
                return;
            }

            const targetDate = new Date(dateValue);
            if (isNaN(targetDate) || targetDate <= new Date()) {
                alert('请输入一个有效的、未来的日期！');
                return;
            }

            const newCountdown = {
                chatId: null, // 用户创建的，不属于任何特定AI
                authorName: '我',
                description: title,
                timestamp: Date.now(),
                type: 'countdown',
                targetDate: targetDate.getTime()
            };

            await db.memories.add(newCountdown);
            document.getElementById('create-countdown-modal').classList.remove('visible');
            renderMemoriesScreen();
        });

        // 【全新】拉黑功能事件绑定
        document.getElementById('block-chat-btn').addEventListener('click', async () => {
            if (!state.activeChatId || state.chats[state.activeChatId].isGroup) return;

            const chat = state.chats[state.activeChatId];
            const confirmed = await showCustomConfirm(
                '确认拉黑',
                `确定要拉黑“${chat.name}”吗？拉黑后您将无法向其发送消息，直到您将Ta移出黑名单，或等待Ta重新申请好友。`,
                { confirmButtonClass: 'btn-danger' }
            );

            if (confirmed) {
                chat.relationship.status = 'blocked_by_user';
                chat.relationship.blockedTimestamp = Date.now();
                await db.chats.put(chat);

                // 关闭设置弹窗，并刷新聊天界面
                document.getElementById('chat-settings-modal').classList.remove('visible');
                renderChatInterface(state.activeChatId);
                // 刷新聊天列表，可能会有UI变化
                renderChatList();
            }
        });

        document.getElementById('chat-lock-overlay').addEventListener('click', async (e) => {
            const chat = state.chats[state.activeChatId];
            if (!chat) return;

            if (e.target.id === 'force-apply-check-btn') {
                alert("正在手动触发好友申请流程，请稍后...\n如果API调用成功，将弹出提示。如果失败，也会有错误提示。如果长时间无反应，说明AI可能决定暂时不申请。");
                await triggerAiFriendApplication(chat.id);
                renderChatInterface(chat.id);
                return;
            }

            if (e.target.id === 'unblock-btn') {
                chat.relationship.status = 'friend';
                chat.relationship.blockedTimestamp = null;
                await db.chats.put(chat);
                renderChatInterface(chat.id);
                renderChatList();
            }
            else if (e.target.id === 'accept-friend-btn') {
                chat.relationship.status = 'friend';
                chat.relationship.applicationReason = '';
                await db.chats.put(chat);
                renderChatInterface(chat.id);
                renderChatList();
                const msg = { role: 'user', content: '我通过了你的好友请求', timestamp: Date.now() };
                chat.history.push(msg);
                await db.chats.put(chat);
                appendMessage(msg, chat);
                triggerAiResponse();
            }
            else if (e.target.id === 'reject-friend-btn') {
                chat.relationship.status = 'blocked_by_user';
                chat.relationship.blockedTimestamp = Date.now();
                chat.relationship.applicationReason = '';
                await db.chats.put(chat);
                renderChatInterface(chat.id);
            }
            // 【新增】处理申请好友按钮的点击事件
            else if (e.target.id === 'apply-friend-btn') {
                const reason = await showCustomPrompt(
                    '发送好友申请',
                    `请输入你想对“${chat.name}”说的申请理由：`,
                    "我们和好吧！"
                );
                // 只有当用户输入了内容并点击“确定”后才继续
                if (reason !== null) {
                    // 更新关系状态为“等待AI批准”
                    chat.relationship.status = 'pending_ai_approval';
                    chat.relationship.applicationReason = reason;
                    await db.chats.put(chat);

                    // 刷新UI，显示“等待通过”的界面
                    renderChatInterface(chat.id);
                    renderChatList();

                    // 【关键】触发AI响应，让它去处理这个好友申请
                    triggerAiResponse();
                }
            }
        });

        // ▼▼▼ 【全新】红包功能事件绑定 ▼▼▼

        // 1. 将原有的转账按钮(￥)的点击事件，重定向到新的总入口函数
        document.getElementById('transfer-btn').addEventListener('click', handlePaymentButtonClick);

        // 2. 红包模态框内部的控制按钮
        document.getElementById('cancel-red-packet-btn').addEventListener('click', () => {
            document.getElementById('red-packet-modal').classList.remove('visible');
        });
        document.getElementById('send-group-packet-btn').addEventListener('click', sendGroupRedPacket);
        document.getElementById('send-direct-packet-btn').addEventListener('click', sendDirectRedPacket);

        // 3. 红包模态框的页签切换逻辑
        const rpTabGroup = document.getElementById('rp-tab-group');
        const rpTabDirect = document.getElementById('rp-tab-direct');
        const rpContentGroup = document.getElementById('rp-content-group');
        const rpContentDirect = document.getElementById('rp-content-direct');

        rpTabGroup.addEventListener('click', () => {
            rpTabGroup.classList.add('active');
            rpTabDirect.classList.remove('active');
            rpContentGroup.style.display = 'block';
            rpContentDirect.style.display = 'none';
        });
        rpTabDirect.addEventListener('click', () => {
            rpTabDirect.classList.add('active');
            rpTabGroup.classList.remove('active');
            rpContentDirect.style.display = 'block';
            rpContentGroup.style.display = 'none';
        });

        // 4. 实时更新红包金额显示
        document.getElementById('rp-group-amount').addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            document.getElementById('rp-group-total').textContent = `¥ ${amount.toFixed(2)}`;
        });
        document.getElementById('rp-direct-amount').addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            document.getElementById('rp-direct-total').textContent = `¥ ${amount.toFixed(2)}`;
        });

        // ▲▲▲ 新事件绑定结束 ▲▲▲

        // ▼▼▼ 【全新添加】使用事件委托处理红包点击，修复失效问题 ▼▼▼
        document.getElementById('chat-messages').addEventListener('click', (e) => {
            // 1. 找到被点击的红包卡片
            const packetCard = e.target.closest('.red-packet-card');
            if (!packetCard) return; // 如果点击的不是红包，就什么也不做

            // 2. 从红包卡片的父级.message-bubble获取时间戳
            const messageBubble = packetCard.closest('.message-bubble');
            if (!messageBubble || !messageBubble.dataset.timestamp) return;

            // 3. 调用我们现有的处理函数
            const timestamp = parseInt(messageBubble.dataset.timestamp);
            handlePacketClick(timestamp);
        });
        // ▲▲▲ 新增代码结束 ▲▲▲

        // ▼▼▼ 【全新】投票功能事件监听器 ▼▼▼
        // 在输入框工具栏添加按钮
        document.getElementById('send-poll-btn').addEventListener('click', openCreatePollModal);

        // 投票创建模态框的按钮
        document.getElementById('add-poll-option-btn').addEventListener('click', addPollOptionInput);
        document.getElementById('cancel-create-poll-btn').addEventListener('click', () => {
            document.getElementById('create-poll-modal').classList.remove('visible');
        });
        document.getElementById('confirm-create-poll-btn').addEventListener('click', sendPoll);

        // 使用事件委托处理投票卡片内的所有点击事件
        document.getElementById('chat-messages').addEventListener('click', (e) => {
            const pollCard = e.target.closest('.poll-card');
            if (!pollCard) return;

            const timestamp = parseInt(pollCard.dataset.pollTimestamp);
            if (isNaN(timestamp)) return;

            // 点击了选项
            const optionItem = e.target.closest('.poll-option-item');
            if (optionItem && !pollCard.classList.contains('closed')) {
                handleUserVote(timestamp, optionItem.dataset.option);
                return;
            }

            // 点击了动作按钮（结束投票/查看结果）
            const actionBtn = e.target.closest('.poll-action-btn');
            if (actionBtn) {
                if (pollCard.classList.contains('closed')) {
                    showPollResults(timestamp);
                } else {
                    endPoll(timestamp);
                }
                return;
            }

            // 如果是已结束的投票，点击卡片任何地方都可以查看结果
            if (pollCard.classList.contains('closed')) {
                showPollResults(timestamp);
            }
        });
        // ▲▲▲ 新事件监听器粘贴结束 ▲▲▲

        // ▼▼▼ 【全新】AI头像库功能事件绑定 ▼▼▼
        document.getElementById('manage-ai-avatar-library-btn').addEventListener('click', openAiAvatarLibraryModal);
        document.getElementById('add-ai-avatar-btn').addEventListener('click', addAvatarToLibrary);
        document.getElementById('close-ai-avatar-library-btn').addEventListener('click', closeAiAvatarLibraryModal);
        // ▲▲▲ 新增结束 ▲▲▲

        // ▼▼▼ 在 init() 的事件监听区域，粘贴这段【新代码】▼▼▼
        document.getElementById('icon-settings-grid').addEventListener('click', async (e) => {
            if (e.target.classList.contains('change-icon-btn')) {
                const item = e.target.closest('.icon-setting-item');
                const iconId = item.dataset.iconId;
                if (!iconId) return;

                const currentUrl = state.globalSettings.appIcons[iconId];
                const newUrl = await showCustomPrompt(`更换“${item.querySelector('.icon-preview').alt}”图标`, '请输入新的图片URL', currentUrl, 'url');

                if (newUrl && newUrl.trim().startsWith('http')) {
                    // 仅在内存中更新，等待用户点击“保存”
                    state.globalSettings.appIcons[iconId] = newUrl.trim();
                    // 实时更新设置页面的预览图
                    item.querySelector('.icon-preview').src = newUrl.trim();
                } else if (newUrl !== null) {
                    alert("请输入一个有效的URL！");
                }
            }
        });
        // ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ▼▼▼ 在 init() 函数的末尾，粘贴这段【全新的事件监听器】 ▼▼▼

        document.getElementById('chat-messages').addEventListener('click', (e) => {
            // 使用 .closest() 向上查找被点击的卡片
            const linkCard = e.target.closest('.link-share-card');
            if (linkCard) {
                const timestamp = parseInt(linkCard.dataset.timestamp);
                if (!isNaN(timestamp)) {
                    openBrowser(timestamp); // 调用我们的函数
                }
            }
        });

        // 浏览器返回按钮的事件监听，确保它只绑定一次
        document.getElementById('browser-back-btn').addEventListener('click', () => {
            showScreen('chat-interface-screen');
        });

        // ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ▼▼▼ 在 init() 函数的末尾，粘贴这段【全新的事件监听器】 ▼▼▼

        // 1. 绑定输入框上方“分享链接”按钮的点击事件
        document.getElementById('share-link-btn').addEventListener('click', openShareLinkModal);

        // 2. 绑定模态框中“取消”按钮的点击事件
        document.getElementById('cancel-share-link-btn').addEventListener('click', () => {
            document.getElementById('share-link-modal').classList.remove('visible');
        });

        // 3. 绑定模态框中“分享”按钮的点击事件
        document.getElementById('confirm-share-link-btn').addEventListener('click', sendUserLinkShare);

        // ▲▲▲ 新代码粘贴结束 ▲▲▲

        // ===================================================================
        // 5. 启动！

        showScreen('home-screen');
    }

    init();
});