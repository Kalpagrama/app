<template lang="pug">
div
  slot
  //- anchor="bottom right" self="top right"
  q-popup-proxy(position="bottom" cover anchor="top right" ref="kPopup")
    div(:style=`{maxWidth: $q.screen.width < 451 ? '100%' : '270px', borderRadius: '10px'}` :class="{'q-pa-sm': $q.screen.width <= 450}").row.fit
      div(:style=`{borderRadius: '10px'}`).row.full-width.bg-white
        //- header with name
        div(v-if="!noName" :style=`{minHeight: '60px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-sm.br
          //- span.text-bold.text-center {{ name }}
        //- actions
        div(v-for="(a, ai) in actions" :key="a.id" @click="$emit('action', a)"
          :style=`{height: '60px', overflow: 'hidden'}`
          ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer.scroll
          span(
            :style=`{color: a.color || 'black', whiteSpace: 'nowrap'}`
            :class="a.class || []").text-bold {{ a.name }}
      //- hide
      div(v-if="$q.screen.width < 451" @click="$emit('hide'), $refs.kPopup.hide()"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.justify-center.q-mt-md.q-px-sm.bg-grey-1
        span().text-bold.text-primary {{ $t('Отмена') }}
</template>

<script>
export default {
  name: 'k_menu_popup',
  props: ['name', 'noName', 'actions'],
  methods: {
    toggle () {
      this.$refs.kPopup.toggle()
    }
  }
}
</script>
