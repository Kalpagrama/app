
export default {
  layouts: {
    'PIP': {type: 'PIP', name: 'Картинка в картинке', component: 'nodeTemplatePip'},
    'HORIZONTAL': {type: 'HORIZONTAL', name: 'Горизонтальный', component: 'nodeTemplatePip'},
    'VERTICAL': {type: 'VERTICAL', name: 'Вертикальный', component: 'nodeTemplatePip'},
    'SLIDER': {type: 'SLIDER', name: 'Слайдер', component: 'nodeTemplatePip'}
  },
  node: null,
  nodeFull: null,
  rateDialogOpened: false,
  categories: []
}
