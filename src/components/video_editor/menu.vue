<template lang="pug">
div(
  v-show="show"
  :style=`{
    position: 'absolute', zIndex: 3000, left: '0px', top: '16px', opacity: opacity,
    height: 'calc(100vh - 210px)', width: width+'px', borderRadius: '0 20px 20px 0', overflow: 'hidden',
  }`).column.bg-grey-3
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
    q-btn(v-show="!toggling" round flat icon="keyboard_arrow_left" color="grey-9" @click="toggle()")
    .col.full-height
      .row.fit.items-center.q-px-sm
        span(v-show="!toggling").text-bold {{$t('Видео редактор')}}
  //- tabs
  div(v-show="!toggling" :style=`{height: '40px'}`).row.full-width.q-px-sm
    span.q-mr-sm {{$t('Фрагменты')}}
    span {{$t('Настройки')}}
  //- body
  .col.scroll
    //- fragments wrapper
    div(v-show="!toggling").row.full-width.items-start.content-start.q-px-sm
      //- fragment
      div(
        v-for="(f, fi) in fragments" :key="fi"
        :style=`{position: 'relative', height: '50px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-start.bg-white.q-mb-sm.q-pa-sm
        div(:style=`{width: '36px', borderRadius: '10px', background: colors[fi]}`).row.full-height.items-center.justify-center
          span(style=`fontSize: 18px`).text-white.text-bold {{fi+1}}
        .col.full-height.q-py-xs
          .row.fit.items-center.content-center.q-px-sm
            .row.full-width
              span.text-black.text-bold {{ f.name }}
            .row.full-width
              small {{ pointCut(f.points[0]) }} - {{ pointCut(f.points[1]) }}
        .row.full-height.items-center.justify-center
          k-menu-popup(:name="f.name || ''" :actions="actions(f, fi)" @action="$event => handleAction(f, fi, $event)")
            q-btn(icon="more_horiz" color="grey-6" flat style=`width: 36px; height: 36px`)
  //- fragment add
  .row.full-width.q-px-sm
    q-btn(outline color="primary" style=`height: 50px; borderRadius: 10px` icon="add" @click="fragmentAdd()").full-width.q-mb-sm
</template>

<script>
export default {
  name: 'videoEditor_menu',
  props: ['fragments', 'colors', 'duration'],
  data () {
    return {
      show: false,
      width: 0,
      opacity: 0,
      toggling: false
    }
  },
  computed: {
    widthMax () {
      let w = this.$q.screen.width
      if (w < 550) return w - 16
      else return 400
    }
  },
  methods: {
    actions (f, fi) {
      return [
        {id: 'play', name: 'Проиграть', color: this.colors[fi]},
        {id: 'rename', name: 'Переименовать', color: 'black'},
        {id: 'setpoints', name: 'Задать точки', color: 'black'},
        {id: 'delete', name: 'Удалить фрагмент', color: 'red'},
      ]
    },
    handleAction (f, fi, a) {
      this.$log('handleAction', a)
      switch (a.id) {
        case 'play': {
          this.fragmentPlay(f, fi)
          break
        }
        case 'rename': {
          this.fragmentRename(f, fi)
          break
        }
        case 'setpoints': {
          this.fragmentSetpoints(f, fi)
          break
        }
        case 'delete': {
          this.fragmentDelete(f, fi)
          break
        }
      }
    },
    pointCut (p) {
      return p.toString().slice(0, 5)
    },
    fragmentPlay (f, fi) {
      this.$log('fragmentPlay', f, fi)
      this.$emit('fragmentPlay', f, fi)
    },
    fragmentRename (f, fi) {
      this.$log('fragmentRename', f, fi)
    },
    fragmentAdd () {
      this.$log('fragmentAdd')
      this.fragments.push({
        oid: Date.now().toString(),
        type: '',
        name: '',
        points: [0, this.$random(1, 30)],
        color: '',
        visible: true
      })
      this.$emit('fragmentAdd')
    },
    fragmentSetpoints (f, fi) {
      this.$log('fragmentSetpoints', f, fi)
    },
    fragmentDelete (f, fi) {
      this.$log('fragmentDelete', f, fi)
      this.$delete(this.fragments, fi)
      this.$emit('fragmentDelete', f, fi)
    },
    fragmentVisible (f, fi) {
      this.$log('fragmentVisible', f, fi)
      this.$set(this.fragments[fi], 'visible', !this.fragments[fi].visible)
      this.$emit('fragmentVisible', f, fi)
    },
    toggle () {
      this.$log('toggle')
      this.toggling = true
      if (this.show) {
        this.$tween.to(
          this,
          0.3,
          {
            width: 20,
            opacity: 0,
            onComplete: () => {
              this.show = false
              this.toggling = false
            }
          }
        )
      } else {
        this.show = true
        this.$tween.to(
          this,
          0.3,
          {
            width: this.widthMax,
            opacity: 0.95,
            onComplete: () => {
              this.toggling = false
            }
          }
        )
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
