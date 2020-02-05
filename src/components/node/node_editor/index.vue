<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
.row.fit.justify-center
  div(
    :style=`{maxWidth: '400px'}`
    ).column.fit
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      .col.full-height
        .row.fit.items-center.content-center.q-px-md
          span.text-bold.text-green Node editor
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.content-center.justify-center
        q-btn(round flat icon="refresh" color="green" :loading="refreshing" @click="refresh()")
    .col.full-width
    div(
      :style=`{minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.bg-grey-10.q-pa-md
      composition-editor
    div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-my-md
      input(
        v-model="name"
        placeholder="Whats the essence?").fit.bg-white.kinput
    div(
      :style=`{minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.bg-grey-10.q-pa-md
      composition-editor
    .col.full-width
    //- category, spheres
    div(:style=`{minHeight: '60px'}`).row.full-width.items-start
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
        span.text-bold.text-green Category & spheres
      .row.full-width.q-px-md
        span.text-green spheres
    //- footer: save, publish
    div(:style=`{height: '60px'}`
      ).row.full-width.items-center.q-px-md
      q-btn(
        outline color="green" no-caps :loading="saving" @click="save()"
        :style=`{borderRadius: '10px'}`)
        span().text-bold.text-green Save
      .col.full-height
      q-btn(
        push color="green" no-caps :loading="publishing" @click="publish()"
        :style=`{borderRadius: '10px'}`)
        span().text-bold Publish
</template>

<script>
import compositionEditor from 'components/node/composition_editor'

export default {
  name: 'nodeEditor',
  components: {compositionEditor},
  data () {
    return {
      name: '',
      saving: false,
      publishing: false,
      refreshing: false
    }
  },
  methods: {
    // node: {
    //   compositions: [
    //     {
    //       layers: [
    //         {
    //           content: {},
    //           figuresAbsolute: [
    //             {t: 0, points: []},
    //             {t: 10}
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // }
    async save () {
      try {
        this.$log('save start')
        this.saving = true
        await this.$wait(2000)
        this.$log('save done')
        this.saving = false
      } catch (e) {
        this.$log('save error', e)
        this.saving = false
      }
      this.$log('save')
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(2000)
        this.$log('publish done')
        this.publishing = false
      } catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
    async refresh () {
      try {
        this.$log('refresh start')
        this.refreshing = true
        await this.$wait(2000)
        this.$log('refresh done')
        this.refreshing = false
      } catch (e) {
        this.$log('refresh error', e)
        this.refreshing = false
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
