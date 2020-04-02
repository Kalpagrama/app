<style lang="sass">
</style>

<template lang="pug">
div(:style=`{}`).column.fit.bg-grey-10
  //- name and spheres editor
  q-dialog(v-model="inputDialogShow" maximized position="right" @show="$wait(1000).then(() => $refs.nameInputRef.focus())")
    div(:style=`{height: $q.screen.height+'px', width: $q.screen.width+'px'}`).column.bg-grey-10
      div(:style=`{height: '60px', paddingLeft: '10px', paddingTop: '10px'}`).row.full-width.items-start.content-start
        q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="inputDialogShow = false"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      .col.full-width.q-pa-sm
        q-input(ref="nameInputRef" v-model="nameInput" filled dark color="green" autogrow type="textarea" :rows="2"
          @keyup.enter="inputDialogShow = false"
          @blur="inputDialogShow = false"
          :style=`{transform: 'translate3d(0,0,0)', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).full-width
  //- preview editor
  q-dialog(v-model="previewDialogShow" maximized position="right")
    div(:style=`{height: $q.screen.height+'px', width: $q.screen.width+'px'}`).column.bg-grey-10
      div(:style=`{height: '60px'}`
        ).row.full-width.items-center.content-center
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="previewDialogShow = false"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
        .col.full-height
          .row.fit.items-center.content-center.justify-center.q-px-sm
            span.text-white.text-bold Composition editor
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-centre.justify-center
          q-btn(round push color="green" icon="check")
  //- body
  div(:style=`{paddingBottom: '0px'}`).col.full-width.scroll.q-pa-xs
    //- add preview
    div(
      :style=`{position: 'relative', height: '200px', borderRadius: '10px'}`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-9.q-mb-sm
      q-btn(round flat color="green" icon="add")
      q-btn(round flat color="white" icon="edit" @click="previewDialogShow = true"
        :style=`{position: 'absolute', zIndex: 100, right: '10px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.3)'}`)
    //- set name
    div(:style=`{minHeight: '60px'}` @click="inputDialogShow = true").row.full-width.q-pa-sm
      //- name
      div(:style=`{height: '60px'}`).row.full-width
        span(
          v-if="nameInput.length > 0"
          ).text-white.text-bold {{ nameInput }}
        span(
          v-else
          ).text-white.text-bold Whats on yout mind?
      //- spheres
      .row.full-width
        span.text-white.text-bold.q-mr-sm FUN:
        span.text-white #klsdmflsk #lkmdflkmdfg #spheres
  //- footer
  div(
    :style=`{position: 'absolute', bottom: '0px', zIndex: 200, height: '60px', background: 'rgba(0,0,0,0.3)'}`
    ).row.full-width.items-center.content-center.justify-between.q-px-sm
    q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="toggle()"
      :style=`{background: 'rgba(0,0,0,0.3)'}`)
    .col
    q-btn(outline color="green" no-caps).q-mr-sm
      span Save
    q-btn(push color="green" no-caps)
      span.text-white.text-bold Publish
</template>

<script>
export default {
  name: 'nodeExplorer_extraExplore_chainAdd',
  data () {
    return {
      input: '',
      nameInput: '',
      height: 60,
      chainAdding: false,
      inputDialogShow: false,
      previewDialogShow: false
    }
  },
  methods: {
    toggle () {
      this.$log('toggle')
      this.$emit('hide')
    },
    inputClick () {
      this.$log('inputClick')
      this.$refs.kalpaInput.focus()
    },
    inputChanged (e) {
      this.$log('inputChanged', e)
      this.nameInput = e.target.value
    },
    async chainAdd () {
      try {
        this.$log('chainAdd start')
        // let chain = {
        //   spheres: [],
        //   links: [
        //     { leftOid: 'AwFnLYEBQAM', rightOid: 'AwFnz1MBQAU', type: 'ESSENCE' }
        //   ]
        // }
        // await context.dispatch('node/chainCreate', chain)
        this.$log('chainAdd done')
      }
      catch (e) {
        this.$log('chainAdd error', e)
      }
    }
  }
}
</script>
