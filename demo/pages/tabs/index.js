Page({
  data: {
    tabs: [
      {
        title: 'Tab 1',
        subTitle: 'Subtitle 1',
        number: '6',
        showBadge: true,
        badge: {
          arrow: true,
          stroke: true,
        },
      },
      {
        title: 'Tab 2',
        subTitle: 'Subtitle 2',
        number: '66',
        showBadge: true,
        badge: {
          arrow: false,
          stroke: true,
        },
      },
      {
        title: 'Tab 3',
        subTitle: 'Subtitle 3',
        number: '99+',
        showBadge: true,
        badge: {
          arrow: true,
        },
      },
      { title: '4 Tab', subTitle: 'Subtitle 5', showBadge: true, number: 0 },
      { title: '5 Tab', subTitle: 'Subtitle 5', number: '99+', showBadge: false },
      { title: '3 Tab', subTitle: 'Subtitle 5', showBadge: false },
      { title: '4 Tab', subTitle: 'Subtitle 5' },
      { title: '15 Tab', subTitle: 'Subtitle 5' },
    ],
    activeTab: 0,
    isSwipeable: false,
  },
  handleTabClick({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
  },
  handleTabChange({ index, tabsName }) {
    this.setData({
      [tabsName]: index,
    });
  },
  onChangeSwipeable() {
    this.setData({ isSwipeable: !this.data.isSwipeable });
  },
});
