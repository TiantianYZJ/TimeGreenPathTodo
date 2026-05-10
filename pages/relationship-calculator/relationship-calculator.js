Page({
  data: {
    currentChain: ['我'],
    result: '',
    relations: {
      '我': {
        husband: '丈夫',
        wife: '妻子',
        father: '爸爸',
        mother: '妈妈',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '哥哥',
        little_brother: '弟弟',
        elder_sister: '姐姐',
        little_sister: '妹妹'
      },
      //////
      '丈夫': {
        husband: '同性婚姻请咨询客服',
        wife: '妻子',
        father: '公公',
        mother: '婆婆',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大伯子',
        little_brother: '小叔子',
        elder_sister: '大姑子',
        little_sister: '小姑子'
      },
      '公公': {
        husband: '同性称呼请咨询客服',
        wife: '婆婆',
        father: '祖翁',
        mother: '祖婆',
        son: ['大伯子', '丈夫', '小叔子'],
        daughter: ['小姑子', '大姑子'],
        elder_brother: '伯翁',
        little_brother: '叔公',
        elder_sister: '姑婆',
        little_sister: '姑婆'
      },
      '婆婆': {
        husband: '丈夫',
        wife: '同性婚姻请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['大伯子', '丈夫', '小叔子'],
        daughter: ['小姑子', '大姑子'],
        elder_brother: '舅公',
        little_brother: '舅公',
        elder_sister: '姨婆',
        little_sister: '姨婆'
      },
      '大舅子': {
        husband: '同性婚姻请咨询客服',
        wife: '舅嫂',
        father: '岳父',
        mother: '岳母',
        son: '内侄',
        daughter: '内侄女',
        elder_brother: '大舅子',
        little_brother: ['小舅子', '大舅子'],
        elder_sister: '大姨子',
        little_sister: ['小姨子', '大姨子', '妻子']
      },
      '小舅子': {
        husband: '同性婚姻请咨询客服',
        wife: '舅弟媳',
        father: '岳父',
        mother: '岳母',
        son: '内侄',
        daughter: '内侄女',
        elder_brother: ['小舅子', '大舅子'],
        little_brother: '小舅子',
        elder_sister: ['小姨子', '大姨子', '妻子'],
        little_sister: '小姨子'
      },
      '大姨子': {
        husband: '大姨夫',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '内甥',
        daughter: '姨甥女',
        elder_brother: '大舅子',
        little_brother: ['小舅子', '大舅子'],
        elder_sister: '大姨子',
        little_sister: ['小姨子', '大姨子', '妻子']
      },
      '小姨子': {
        husband: '小姨夫',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '內甥',
        daughter: '姨甥女',
        elder_brother: ['小舅子', '大舅子'],
        little_brother: '小舅子',
        elder_sister: ['小姨子', '大姨子', '妻子'],
        little_sister: '小姨子'
      },
      '祖翁': {
        husband: '同性婚姻请咨询客服',
        wife: '祖婆',
        father: '太公翁',
        mother: '太奶亲',
        son: ['叔公', '伯翁', '公公'],
        daughter: '姑婆',
        elder_brother: '伯祖翁',
        little_brother: '叔祖翁',
        elder_sister: '祖姑母',
        little_sister: '祖姑母'
      },
      '祖婆': {
        husband: '祖翁',
        wife: '同性婚姻请咨询客服',
        father: '曾外祖父',
        mother: '曾外祖母',
        son: ['叔公', '伯翁', '公公'],
        daughter: '姑婆',
        elder_brother: '舅公',
        little_brother: '舅公',
        elder_sister: '祖姨母',
        little_sister: '祖姑母'
      },
      '大伯子': {
        husband: '同性婚姻请咨询客服',
        wife: '大婶子',
        father: '公公',
        mother: '婆婆',
        son: '婆家侄',
        daughter: '侄女',
        elder_brother: '大伯子',
        little_brother: ['大伯子', '丈夫', '小叔子'],
        elder_sister: '大伯子',
        little_sister: ['小姑子', '大姑子']
      },////////////////////////////////////////////////////////////////////////////////////
      '': {
        husband: '同性婚姻请咨询客服',
        wife: '同性婚姻请咨询客服',
        father: '',
        mother: '',
        son: '',
        daughter: '',
        elder_brother: ['', ''],
        little_brother: '',
        elder_sister: ['', '', ''],
        little_sister: ''
      },

      '': {
        husband: '同性婚姻请咨询客服',
        wife: '同性婚姻请咨询客服',
        father: '',
        mother: '',
        son: '',
        daughter: '',
        elder_brother: ['', ''],
        little_brother: '',
        elder_sister: ['', '', ''],
        little_sister: ''
      },

      '': {
        husband: '同性婚姻请咨询客服',
        wife: '同性婚姻请咨询客服',
        father: '',
        mother: '',
        son: '',
        daughter: '',
        elder_brother: ['', ''],
        little_brother: '',
        elder_sister: ['', '', ''],
        little_sister: ''
      },

      '': {
        husband: '同性婚姻请咨询客服',
        wife: '同性婚姻请咨询客服',
        father: '',
        mother: '',
        son: '',
        daughter: '',
        elder_brother: ['', ''],
        little_brother: '',
        elder_sister: ['', '', ''],
        little_sister: ''
      },



      '妻子': {
        husband: '丈夫',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '岳父': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '岳母': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '大舅子': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '小舅子': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '大姨子': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      '小姨子': {
        husband: '妻子',
        wife: '同性婚姻请咨询客服',
        father: '岳父',
        mother: '岳母',
        son: '儿子',
        daughter: '女儿',
        elder_brother: '大舅子',
        little_brother: '小舅子',
        elder_sister: '大姨子',
        little_sister: '小姨子'
      },
      //////
      '爸爸': {
        husband: '同性婚姻请咨询客服',
        wife: '妈妈',
        father: '爷爷',
        mother: '奶奶',
        son: ['我', '哥哥', '弟弟'],
        daughter: ['我', '姐姐', '妹妹'],
        elder_brother: '伯父',
        little_brother: '叔叔',
        elder_sister: '姑妈',
        little_sister: '姑妈'
      },
      '妈妈': {
        husband: '爸爸',
        wife: '同性婚姻请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['我', '哥哥', '弟弟'],
        daughter: ['我', '姐姐', '妹妹'],
        elder_brother: '大舅',
        little_brother: '小舅',
        elder_sister: '大姨',
        little_sister: '小姨'
      },
      '爷爷': {
        husband: '同性婚姻请咨询客服',
        wife: '奶奶',
        father: '曾祖父',
        mother: '曾祖母',
        son: ['叔叔', '伯父', '爸爸'],
        daughter: ['姑妈'],
        elder_brother: '伯祖父',
        little_brother: '叔祖父',
        elder_sister: '祖姑母',
        little_sister: '祖姑母'
      },
      '奶奶': {
        husband: '爷爷',
        wife: '同性婚姻请咨询客服',
        father: '外曾祖父',
        mother: '外曾祖母',
        son: ['叔叔', '伯父', '爸爸'],
        daughter: ['姑妈'],
        elder_brother: '舅公',
        little_brother: '舅公',
        elder_sister: '祖姨母',
        little_sister: '祖姨母'
      },
      '外公': {
        husband: '同性婚姻请咨询客服',
        wife: '外婆',
        father: '外曾祖父',
        mother: '外曾祖母',
        son: ['舅舅'],
        daughter: ['妈妈', '姨妈'],
        elder_brother: '伯外祖父',
        little_brother: '叔外祖父',
        elder_sister: '姑外祖母',
        little_sister: '姑外祖母'
      },
      '外婆': {
        husband: '外公',
        wife: '同性婚姻请咨询客服',
        father: '外曾外祖父',
        mother: '外曾外祖母',
        son: ['舅舅'],
        daughter: ['妈妈', '姨妈'],
        elder_brother: '外舅公',
        little_brother: '外舅公',
        elder_sister: '姨外舅母',
        little_sister: '姨外舅母'
      },
      '伯父': {
        husband: '同性婚姻请咨询客服',
        wife: '伯母',
        father: '爷爷',
        mother: '奶奶',
        son: ['堂弟', '堂哥'],
        daughter: ['堂姐', '堂妹'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      },
      '舅舅': {
        husband: '同性婚姻请咨询客服',
        wife: '舅妈',
        father: '外公',
        mother: '外婆',
        son: ['舅表弟', '舅表哥'],
        daughter: ['舅表姐', '舅表妹'],
        elder_brother: '舅舅',
        little_brother: '舅舅',
        elder_sister: ['姨妈', '妈妈'],
        little_sister: ['姨妈', '妈妈']
      },
      '姑妈': {
        husband: '姑丈',
        wife: '同性婚姻请咨询客服',
        father: '爷爷',
        mother: '奶奶',
        son: ['姑表弟', '姑表哥'],
        daughter: ['姑表妹', '姑表姐'],
        elder_brother: ['叔叔', '伯父', '爸爸'],
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑妈',
        little_sister: '姑妈'
      },
      '叔叔': {
        husband: '同性称呼请咨询客服',
        wife: '婶婶',
        father: '爷爷',
        mother: '奶奶',
        son: ['堂弟', '堂哥'],
        daughter: ['堂姐', '堂妹'],
        elder_brother: ['叔叔', '伯父', '爸爸'],
        little_brother: '叔叔',
        elder_sister: '姑妈',
        little_sister: '姑母'
      },
      '大姨': {
        husband: '大姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '大舅',
        little_brother: '舅舅',
        elder_sister: '大姨',
        little_sister: ['姨妈', '妈妈']
      },
      '大姨父': {
        husband: '同性称呼请咨询客服',
        wife: '大姨',
        father: '0',
        mother: '0',
        son: ['姨表哥', '姨表弟'],
        daughter: ['姨表姐', '姨表妹'],
        elder_brother: '0',
        little_brother: '0',
        elder_sister: '0',
        little_sister: '0'
      },
      '小姨': {
        husband: '小姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['姨表哥', '姨表弟'],
        daughter: ['姨表姐', '姨表妹'],
        elder_brother: '舅舅',
        little_brother: '小舅',
        elder_sister: ['姨妈', '妈妈'],
        little_sister: '小姨'
      },
      '小姨父': {
        husband: '同性请咨询客服',
        wife: '小姨',
        father: '0',
        mother: '0',
        son: ['姨表哥', '姨表弟'],
        daughter: ['姨表姐', '姨表妹'],
        elder_brother: '0',
        little_brother: '0',
        elder_sister: '0',
        little_sister: '0'
      },
      '大舅': {
        husband: '同性请咨询客服',
        wife: '大舅妈',
        father: '外公',
        mother: '外婆',
        son: ['舅表弟', '舅表哥'],
        daughter: ['舅表姐', '舅表妹'],
        elder_brother: '大舅',
        little_brother: '舅舅',
        elder_sister: '大姨',
        little_sister: ['姨妈', '妈妈']
      },
      '大舅妈': {
        husband: '大舅',
        wife: '同性称呼请咨询客服',
        father: '0',
        mother: '0',
        son: ['舅表弟', '舅表哥'],
        daughter: ['舅表姐', '舅表妹'],
        elder_brother: '0',
        little_brother: '0',
        elder_sister: '0',
        little_sister: '0'
      },
      '小舅': {
        husband: '同性请咨询客服',
        wife: '小舅妈',
        father: '外公',
        mother: '外婆',
        son: ['舅表弟', '舅表哥'],
        daughter: ['舅表姐', '舅表妹'],
        elder_brother: '舅舅',
        little_brother: '小舅',
        elder_sister: ['姨妈', '妈妈'],
        little_sister: '小姨'
      },
      '小舅妈': {
        husband: '小舅',
        wife: '同性称呼请咨询客服',
        father: '0',
        mother: '0',
        son: ['舅表弟', '舅表哥'],
        daughter: ['舅表姐', '舅表妹'],
        elder_brother: '0',
        little_brother: '0',
        elder_sister: '0',
        little_sister: '0'
      },
      '姨表哥': {
        husband: '同性称呼请咨询客服',
        wife: '姨表嫂',
        father: '大姨父',
        mother: '大姨',
        son: '表侄',
        daughter: '表侄女',
        elder_brother: ['姨表哥', '姨表弟'],
        little_brother: ['姨表哥', '姨表弟'],
        elder_sister: ['姨表姐', '姨表妹'],
        little_sister: ['姨表姐', '姨表妹']
      },
      '姨表弟': {
        husband: '同性称呼请咨询客服',
        wife: '姨表弟媳',
        father: '大姨父',
        mother: '大姨',
        son: '表侄',
        daughter: '表侄女',
        elder_brother: ['姨表哥', '姨表弟'],
        little_brother: ['姨表哥', '姨表弟'],
        elder_sister: ['姨表姐', '姨表妹'],
        little_sister: ['姨表姐', '姨表妹']
      },
      '姨表弟': {
        husband: '同性称呼请咨询客服',
        wife: '姨表弟媳',
        father: '大姨父',
        mother: '大姨',
        son: '表侄',
        daughter: '表侄女',
        elder_brother: ['姨表哥', '姨表弟'],
        little_brother: ['姨表哥', '姨表弟'],
        elder_sister: ['姨表姐', '姨表妹'],
        little_sister: ['姨表姐', '姨表妹']
      },
      '表侄': {
        husband: '同性称呼请咨询客服',
        wife: '0',
        father: ['姨表哥', '姨表弟'],
        mother: ['姨表嫂', '姨表弟媳'],
        son: '表侄孙',
        daughter: '表侄孙女',
        elder_brother: '表侄',
        little_brother: '表侄',
        elder_sister: '表侄女',
        little_sister: '表侄女'
      },/////////////////////////////////////////////////////////////////////////
      '表侄孙': {
        husband: '同性称呼请咨询客服',
        wife: '表侄孙媳妇',
        father: '表侄',
        mother: '0',
        son: '0',
        daughter: '0',
        elder_brother: '表侄孙',
        little_brother: '表侄孙',
        elder_sister: '表侄孙女',
        little_sister: '表侄孙女'
      },
      '表侄孙女': {
        husband: '表侄孙女婿',
        wife: '同性称呼请咨询客服',
        father: '表侄',
        mother: '0',
        son: '0',
        daughter: '0',
        elder_brother: '表侄孙',
        little_brother: '表侄孙',
        elder_sister: '表侄孙女',
        little_sister: '表侄孙女'
      },
      '表侄孙女婿': {
        husband: '同性称呼请咨询客服',
        wife: '表侄孙女',
        father: '0',
        mother: '0',
        son: '0',
        daughter: '0',
        elder_brother: '0',
        little_brother: '0',
        elder_sister: '0',
        little_sister: '0'
      },///////////////////////////////////////////
      '姨表妹': {
        husband: '姨表妹夫',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      },
      '舅表哥': {
        husband: '大姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      },
      '舅表弟': {
        husband: '大姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      },
      '舅表姐': {
        husband: '大姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      },
      '舅表妹': {
        husband: '大姨父',
        wife: '同性称呼请咨询客服',
        father: '外公',
        mother: '外婆',
        son: ['堂兄', '堂弟'],
        daughter: ['姨表哥', '姨表弟'],
        elder_brother: '伯父',
        little_brother: ['叔叔', '伯父', '爸爸'],
        elder_sister: '姑母',
        little_sister: '姑妈'
      }
    }
  },

  // 关系按键处理
  tapRelation(e) {
    const relation = e.currentTarget.dataset.relation;
    const newChain = this.data.result 
      ? [this.data.result.split('→').pop().trim(), relation]
      : [...this.data.currentChain, relation];
    
    this.setData({ 
      currentChain: newChain,
      result: '' 
    });
    wx.vibrateShort();
  },

  // 计算结果
  calculate() {
    if (this.data.currentChain.length < 2) {
      this.showResult("请选择至少一个关系");
      return;
    }

    let current = '我';
    const chain = this.data.currentChain.slice(1);
    const isReverse = this.data.isReverse;
    const relations = this.data.relations;

    try {
      // 处理反向查询
      if (isReverse) {
        chain.reverse().unshift(current);
        current = chain.pop();
      }

      for (const relationKey of chain) {
        const currentNode = relations[current];
        
        if (!currentNode) {
          throw `未知节点: ${current}`;
        }

        // 处理特殊提示
        if (currentNode[relationKey] === '同性婚姻请咨询客服') {
          this.showResult('暂不支持同性婚姻称呼查询\n请联络客服获取帮助');
          return;
        }

        const nextNode = Array.isArray(currentNode[relationKey]) 
          ? currentNode[relationKey][0]  // 取第一个可能结果
          : currentNode[relationKey];

        if (!nextNode) {
          throw `关系链中断在: ${current} → ${relationKey}`;
        }

        current = nextNode;
      }

      // 处理反向显示
      const displayChain = isReverse 
        ? [current, ...chain.slice(1)].reverse()
        : ['我', ...chain];

      this.showResult(`${displayChain.join('的')} → ${current}${isReverse ? '（反向）' : ''}`);
    } catch (error) {
      this.showResult(error);
    }
  },

  // 新增方法
  deleteLastRelation() {
    if (this.data.currentChain.length > 1) {
      const newChain = this.data.currentChain.slice(0, -1)
      this.setData({
        currentChain: newChain,
        result: ''
      })
      wx.vibrateShort()
    }
  },

  clearAll() {
    this.setData({
      currentChain: ['我'],
      result: ''
    })
    wx.vibrateShort()
  },

  // 新增互查功能
  toggleReverse() {
    this.setData({
      isReverse: !this.data.isReverse,
      result: ''
    })
    wx.vibrateShort()
  },

  showResult(msg) {
    this.setData({ result: msg });
  }
});