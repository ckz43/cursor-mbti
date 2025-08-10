#!/usr/bin/env node

/**
 * MBTI项目图片替换脚本
 * 用于批量替换项目中的占位符图片为真实图片
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🖼️  MBTI项目图片替换脚本启动...\n');

// 图片映射配置
const imageMapping = {
  // 创始人照片映射
  founders: {
    '/images/founders/carl-jung.svg': '/images/founders/carl-jung-real.jpg',
    '/images/founders/isabel-myers.svg': '/images/founders/isabel-myers-real.jpg',
    '/images/founders/katharine-briggs.svg': '/images/founders/katharine-briggs-real.jpg'
  },
  
  // MBTI角色图片映射（16种性格）
  characters: {
    // 分析师组 (NT)
    'intj': { name: 'Stewie Griffin', file: 'intj-stewie.png', from: '恶搞之家' },
    'intp': { name: 'Charlie Brown', file: 'intp-charlie-brown.png', from: '史努比' },
    'entj': { name: 'Eric Cartman', file: 'entj-cartman.png', from: '南方公园' },
    'entp': { name: 'Rick Sanchez', file: 'entp-rick.png', from: '瑞克和莫蒂' },
    
    // 外交官组 (NF)  
    'infj': { name: 'Kyle Broflovski', file: 'infj-kyle.png', from: '南方公园' },
    'infp': { name: 'Butters Stotch', file: 'infp-butters.png', from: '南方公园' },
    'enfj': { name: 'Mufasa', file: 'enfj-mufasa.png', from: '狮子王' },
    'enfp': { name: 'Anna', file: 'enfp-anna.png', from: '冰雪奇缘' },
    
    // 守护者组 (SJ)
    'istj': { name: 'Hank Hill', file: 'istj-hank.png', from: '一家之主' },
    'isfj': { name: 'Marge Simpson', file: 'isfj-marge.png', from: '辛普森一家' },
    'estj': { name: 'Lucy van Pelt', file: 'estj-lucy.png', from: '史努比' },
    'esfj': { name: 'Molly Weasley', file: 'esfj-molly.png', from: '哈利波特' },
    
    // 探索者组 (SP)
    'istp': { name: 'Kenny McCormick', file: 'istp-kenny.png', from: '南方公园' },
    'isfp': { name: 'Schroeder', file: 'isfp-schroeder.png', from: '史努比' },
    'estp': { name: 'Bart Simpson', file: 'estp-bart.png', from: '辛普森一家' },
    'esfp': { name: 'Homer Simpson', file: 'esfp-homer.png', from: '辛普森一家' }
  }
};

// 需要更新的文件列表
const filesToUpdate = [
  'src/components/Authority/FoundersSection.vue',
  'src/components/Characters/MBTICharacters.vue',
  'src/components/Authority/ScientificFoundation.vue'
];

// 检查文件是否存在
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error.message);
    return null;
  }
}

// 写入文件内容
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已更新文件: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 写入文件失败: ${filePath}`, error.message);
    return false;
  }
}

// 创建目录（如果不存在）
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 已创建目录: ${dirPath}`);
  }
}

// 更新创始人组件
function updateFoundersSection() {
  const filePath = 'src/components/Authority/FoundersSection.vue';
  
  if (!checkFileExists(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    return false;
  }
  
  let content = readFile(filePath);
  if (!content) return false;
  
  // 替换SVG图片路径为真实照片
  Object.entries(imageMapping.founders).forEach(([oldPath, newPath]) => {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, newPath);
  });
  
  return writeFile(filePath, content);
}

// 生成MBTI角色数据
function generateMBTICharactersData() {
  const characters = Object.entries(imageMapping.characters).map(([type, data]) => {
    return {
      id: type,
      name: data.name,
      type: type.toUpperCase(),
      description: getTypeDescription(type),
      image: `/images/characters/${data.file}`,
      source: data.from
    };
  });
  
  return characters;
}

// 获取MBTI类型描述
function getTypeDescription(type) {
  const descriptions = {
    // 分析师组 (NT)
    'intj': '理性思考，追求知识和能力',
    'intp': '独立思考，战略规划', 
    'entj': '天生的领导者',
    'entp': '创新能力，战略思考',
    
    // 外交官组 (NF)
    'infj': '理想主义，追求和平',
    'infp': '独立思考，追求梦想',
    'enfj': '鼓舞他人，天生领导',
    'enfp': '热情洋溢，充满创意',
    
    // 守护者组 (SJ) 
    'istj': '逻辑思维，尽职尽责',
    'isfj': '守护他人，战略规划',
    'estj': '执行力强，逻辑规划',
    'esfj': '关心他人，尽职尽责',
    
    // 探索者组 (SP)
    'istp': '灵活应变，冷静思考',
    'isfp': '艺术天赋，追求美感',
    'estp': '行动力强，适应性好',
    'esfp': '热情开朗，生活有趣'
  };
  
  return descriptions[type] || '独特的性格特质';
}

// 更新MBTI角色组件
function updateMBTICharacters() {
  const filePath = 'src/components/Characters/MBTICharacters.vue';
  
  if (!checkFileExists(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    return false;
  }
  
  let content = readFile(filePath);
  if (!content) return false;
  
  // 生成新的角色数据
  const charactersData = generateMBTICharactersData();
  
  // 按组分类
  const groups = {
    analysts: charactersData.filter(c => ['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(c.type)),
    diplomats: charactersData.filter(c => ['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(c.type)),
    sentinels: charactersData.filter(c => ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(c.type)),
    explorers: charactersData.filter(c => ['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(c.type))
  };
  
  // 替换script部分的数据
  const scriptMatch = content.match(/<script setup lang="ts">([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    let scriptContent = scriptMatch[1];
    
    // 更新characterGroups数据
    const newGroupsData = `
const characterGroups = ref([
  {
    id: 'analysts',
    name: '分析师 (NT)',
    description: '理性思考，追求知识和能力',
    color: 'purple',
    characters: ${JSON.stringify(groups.analysts, null, 6)}
  },
  {
    id: 'diplomats', 
    name: '外交官 (NF)',
    description: '理想主义，以人为本',
    color: 'green',
    characters: ${JSON.stringify(groups.diplomats, null, 6)}
  },
  {
    id: 'sentinels',
    name: '守护者 (SJ)', 
    description: '稳定可靠，尽职尽责',
    color: 'blue',
    characters: ${JSON.stringify(groups.sentinels, null, 6)}
  },
  {
    id: 'explorers',
    name: '探索者 (SP)',
    description: '灵活应变，享受当下', 
    color: 'yellow',
    characters: ${JSON.stringify(groups.explorers, null, 6)}
  }
])`;
    
    // 替换characterGroups定义
    scriptContent = scriptContent.replace(
      /const characterGroups = ref\(\[[\s\S]*?\]\)/,
      newGroupsData
    );
    
    // 重构完整的script内容
    const newScriptContent = `<script setup lang="ts">${scriptContent}</script>`;
    content = content.replace(/<script setup lang="ts">[\s\S]*?<\/script>/, newScriptContent);
  }
  
  return writeFile(filePath, content);
}

// 创建图片目录结构
function createImageDirectories() {
  const directories = [
    'public/images/founders',
    'public/images/characters', 
    'public/images/institutions'
  ];
  
  directories.forEach(dir => {
    ensureDirectory(dir);
  });
}

// 生成图片下载清单
function generateDownloadChecklist() {
  const checklist = {
    founders: [
      {
        name: '卡尔·荣格',
        filename: 'carl-jung-real.jpg',
        source: 'ETH-Bibliothek (瑞士联邦理工学院图书馆)',
        url: 'https://commons.wikimedia.org/wiki/File:ETH-BIB-Jung,_Carl_Gustav_(1875-1961)-Portrait-Portr_14163_(cropped).tif'
      },
      {
        name: '伊莎贝尔·迈尔斯',
        filename: 'isabel-myers-real.jpg', 
        source: 'Myers & Briggs Foundation / CAPT Archives',
        search: 'Isabel Briggs Myers official portrait photograph'
      },
      {
        name: '凯瑟琳·布里格斯',
        filename: 'katharine-briggs-real.jpg',
        source: 'Michigan State University Archives',
        url: 'https://en.wikipedia.org/wiki/Katharine_Cook_Briggs'
      }
    ],
    characters: Object.entries(imageMapping.characters).map(([type, data]) => ({
      type: type.toUpperCase(),
      name: data.name,
      filename: data.file,
      source: data.from,
      search: `${data.name} PNG transparent background`
    }))
  };
  
  const checklistContent = `# 📋 图片下载清单

## 创始人照片 (3张)

${checklist.founders.map(item => `
### ${item.name}
- **文件名**: ${item.filename}
- **来源**: ${item.source}
- **搜索**: ${item.search || '直接链接'}
- **链接**: ${item.url || '见搜索关键词'}
- **保存路径**: public/images/founders/${item.filename}
`).join('')}

## MBTI角色图片 (16张)

${checklist.characters.map(item => `
### ${item.type} - ${item.name}
- **文件名**: ${item.filename}
- **来源**: ${item.source}
- **搜索**: ${item.search}
- **保存路径**: public/images/characters/${item.filename}
`).join('')}

## 下载完成检查

创始人照片:
- [ ] carl-jung-real.jpg
- [ ] isabel-myers-real.jpg  
- [ ] katharine-briggs-real.jpg

角色图片:
${checklist.characters.map(item => `- [ ] ${item.filename}`).join('\n')}

## 下载完成后
运行以下命令更新组件中的图片路径：
\`\`\`bash
node replace-images.js
\`\`\`
`;

  writeFile('图片下载清单.md', checklistContent);
}

// 检查图片文件是否存在
function checkDownloadedImages() {
  console.log('\n🔍 检查已下载的图片...\n');
  
  let foundImages = 0;
  let totalImages = 0;
  
  // 检查创始人照片
  console.log('📸 创始人照片:');
  const founderImages = ['carl-jung-real.jpg', 'isabel-myers-real.jpg', 'katharine-briggs-real.jpg'];
  founderImages.forEach(img => {
    totalImages++;
    const path = `public/images/founders/${img}`;
    if (checkFileExists(path)) {
      console.log(`  ✅ ${img}`);
      foundImages++;
    } else {
      console.log(`  ❌ ${img} (未找到)`);
    }
  });
  
  // 检查角色图片
  console.log('\n🎭 角色图片:');
  Object.values(imageMapping.characters).forEach(data => {
    totalImages++;
    const path = `public/images/characters/${data.file}`;
    if (checkFileExists(path)) {
      console.log(`  ✅ ${data.file} (${data.name})`);
      foundImages++;
    } else {
      console.log(`  ❌ ${data.file} (${data.name}) (未找到)`);
    }
  });
  
  console.log(`\n📊 图片下载进度: ${foundImages}/${totalImages} (${Math.round(foundImages/totalImages*100)}%)`);
  
  if (foundImages === totalImages) {
    console.log('🎉 所有图片都已准备就绪！');
    return true;
  } else {
    console.log('⚠️  请先下载缺失的图片，然后重新运行此脚本。');
    return false;
  }
}

// 主执行函数
function main() {
  console.log('🎯 开始执行图片替换任务...\n');
  
  // 1. 创建必要的目录
  console.log('📁 创建图片目录...');
  createImageDirectories();
  
  // 2. 生成下载清单
  console.log('📋 生成图片下载清单...');
  generateDownloadChecklist();
  
  // 3. 检查图片是否已下载
  const allImagesReady = checkDownloadedImages();
  
  if (!allImagesReady) {
    console.log('\n📖 请查看 "图片下载清单.md" 和 "图片资源下载指南.md" 获取详细的下载指导。');
    console.log('下载完成后重新运行此脚本进行图片路径替换。');
    return;
  }
  
  // 4. 更新组件文件
  console.log('\n🔄 更新组件文件...');
  
  let updateCount = 0;
  
  if (updateFoundersSection()) {
    updateCount++;
  }
  
  if (updateMBTICharacters()) {
    updateCount++;
  }
  
  console.log(`\n✨ 图片替换完成！共更新了 ${updateCount} 个组件文件。`);
  console.log('\n🚀 现在可以重新启动开发服务器查看效果：');
  console.log('npm run dev');
}

// 直接调用主函数
main();

export {
  imageMapping,
  updateFoundersSection,
  updateMBTICharacters,
  checkDownloadedImages
};