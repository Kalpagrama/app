<style lang="stylus">
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf").bg-white
  //- header
  q-header(reveal).row.full-width.justify-center.bg-white
    div(:style=`{height: '50px', maxWidth: $store.state.ui.pageMaxWidth+'px'}`
      ).row.full-width.items-center.justify-between.q-px-sm.bg-white
      transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
        q-btn(
          v-if="true"
          flat round no-caps color="red" icon="refresh" :loading="nodePurging" @click="nodePurge()")
      .col
      transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="nodeSavePossible"
          flat no-caps color="green" :disable="!nodeSavePossible" :loading="nodeSaving" @click="nodeSave()").q-mr-sm
          span.text-bold Save
      transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
        q-btn(
          v-if="nodeSavePossible"
          push no-caps color="green" :disable="!nodePublishPossible" :loading="nodePublishing" @click="nodePublish()")
          span.text-bold Publish
  //- footer
  q-footer(reveal).row.full-width.justify-center.bg-white
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', background: 'white'}`)
  //- body
  q-page-container.row.full-width.justify-center.items-start.content-start
      //- transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="node"
        :style=`{
          position: 'relative',
          minHeight: $q.screen.height-170+'px',
          maxWidth: $store.state.ui.pageMaxWidth+'px'}`
        ).row.full-width.items-start.content-start.bg-white
        div(
          v-if="false"
          :style=`{height: '40px'}`).row.full-width.items-center.q-px-sm
          small(@click="refresh()").bg-red.text-white.cursor-pointer.q-mx-sm refresh
          .col
          small.bg-red-2 OID: {{ node.oid }}, version: {{nodeVersion}}
        //- .row.full-width.q-px-md.q-pa-sm
        //-   span(:style=`{fontSize: '17px'}`).text-bold {{$t('Добавить образ')}}
        .row.full-width.bg-white.q-px-sm
          fragment-finder(ref="fragmentFinder" @fragment="$event => fragmentFound(node.fragments.length, $event)")
        //- div(:style=`{position: 'relative'}`).column.full-width
        //-   div(:style=`{maxHeight: $q.screen.height/2+'px'}`).col.full-width.scroll
        //- .row.full-width.q-px-md.q-pa-sm
        //-   span(:style=`{fontSize: '17px'}`).text-bold {{$t('Образы')}}
        .row.full-width.items-start.content-start.q-px-sm
              draggable(
                v-model="node.fragments"
                v-bind="dragOptions"
                @start="fragmentDragging = true"
                @end="fragmentDragging = false"
                handle=".handle"
                ).full-width
                transition-group(type="transition" name="flip-list")
                  div(
                    v-for="(f, fi) in fragmentsFilter" :key="f.order"
                    :style=`{
                      position: 'relative',
                      minHeight: '50px'}`
                    ).row.full-width.items-start.content-start.bg-white.q-mb-sm
                    fragment-editor(
                      v-if="fragmentEditing === f.order"
                      ctx="inEditor" :index="fi" :fragment="f"
                      @edited="fragmentEditing = -1" @delete="fragmentDelete(f.order)")
                    div(
                      v-else
                      :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
                      :class=`{'bg-grey-4': fi !== node.fragments.length-1, 'bg-grey-4': fi === node.fragments.length-1}`
                      ).row.full-width.items-start.content-start.bg-grey-3
                      img(
                        @click="fragmentEditing = f.order"
                        :src="f.content.thumbUrl" draggable="false"
                        :style=`{height: '100%', objectFit: 'contain', borderRadius: '10px', overflow: 'hidden'}`).cursor-pointer
                      div(
                        @click="fragmentEditing = f.order"
                        :style=`{position: 'relative'}` v-ripple=`{color: 'white'}`
                        ).col.full-height.cursor-pointer
                        .row.fit.items-center.content-center.q-px-sm
                          //- small.text-black {{ f.order }}
                          span(
                            :class=`{'text-bold': fi === node.fragments.length-1}`
                            :style=`{maxWidth: '80%', overflow: 'hidden'}`
                            ) {{ f.name || f.content.name | cut(35)}}
                      div(:style=`{height: '50px', width: '66px'}`).row.items-center.justify-center.handle
                        q-btn(round flat color="grey" icon="drag_indicator")
        //- .row.full-width.bg-white.q-pa-sm
        //-   fragment-editor(v-if="node.fragments[0]" ref="fragmentEditorFirst" :index="0" :fragment="node.fragments[0]" @delete="fragmentDelete")
        //-   fragment-finder(v-else @fragment="$event => fragmentFound(0, $event)")
        div(v-if="true").row.full-width.justify-center
          textarea(
            v-model="node.name" ref="nodeNameInput" autofocus
            placeholder="В чем суть?" rows="3" @input="nameChanged"
            :style=`{fontSize: '30px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '5px', paddingBottom: '5px', maxHeight: '150px'}`
            ).full-width.kinput.text-bold.text-black
        //- div(v-if="node.fragments[0]").row.full-width.bg-white.q-pa-sm
        //-   fragment-editor(v-if="node.fragments[1]" ref="fragmentEditorSecond" :index="1" :fragment="node.fragments[1]" @delete="fragmentDelete")
        //-   fragment-finder(v-else @fragment="$event => fragmentFound(1, $event)")
        transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          node-editor-spheres(
            v-if="node && nodeSavePossible" :node="node"
            :style=`{marginTop: '300px', marginBottom: '70px'}`)
      //- no node
      //- transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="!node"
        :style=`{minHeight: $q.screen.height-170+'px'}`).row.full-width.items-center.content-center.justify-center
        q-spinner(size="50px" color="green")
</template>

<script>
import fragmentFinder from 'components/node/fragment_finder'
import fragmentEditor from 'components/node/fragment_editor'
import nodeEditorSpheres from './spheres'
import draggable from 'vuedraggable'

export default {
  name: 'nodeEditor',
  components: {fragmentFinder, fragmentEditor, nodeEditorSpheres, draggable},
  data () {
    return {
      menuShow: false,
      node: null,
      nodeNew: {
        name: '',
        layout: 'PIP',
        fragments: [],
        spheres: [],
        categories: ['FUN']
      },
      nodeVersion: 0,
      nodeSpheresHeight: 50,
      nodeSaving: false,
      nodeSavingError: null,
      nodePurging: false,
      nodePublishing: false,
      nodePublishingError: null,
      fragmentEditing: -1,
      fragmentDragging: false
    }
  },
  computed: {
    fragmentsFilter () {
      return this.node.fragments.reduce((acc, val, index) => {
        let f = val
        if (!f.order) f.order = index + 1
        acc.push(f)
        return acc
      }, [])
    },
    dragOptions() {
      return {
        animation: 0,
        group: 'fragments',
        disabled: false,
        ghostClass: 'ghost'
      }
    },
    nodeSavePossible () {
      if (this.node &&
        this.node.name.length > 3) {
          return true
        } else {
          return false
        }
    },
    nodePublishPossible () {
      if (this.node &&
        this.node.fragments[0] !== null &&
        this.node.fragments[1] !== null &&
        this.node.fragments.length === 2) {
          return true
        } else {
          return false
        }
    }
  },
  watch: {
    node: {
      deep: true,
      immediate: false,
      handler (to, from) {
        this.$log('node CHANGED', to)
        localStorage.setItem('knode', JSON.stringify(to))
        this.nodeVersion += 1
      }
    }
  },
  methods: {
    nameChanged (e) {
      // this.$log('nameChanged', e)
      e.target.style.height = e.target.scrollHeight + 'px'
    },
    async fragmentClick (f) {
      this.$log('fragmentClick', f)
      if (this.fragmentEditing === f.order) {
        this.fragmentEditing = -1
      } else {
        this.fragmentEditing = f.order
      }
    },
    fragmentFound (index, fragment) {
      this.$log('fragmentFound', index, fragment)
      this.$set(this.node.fragments, index, JSON.parse(JSON.stringify(fragment)))
    },
    fragmentActionStart (f) {
      this.$log('fragmentActionStart', f)
      this.$store.dispatch('ui/action', [
        {
          payload: f.order,
          timeout: 5000,
          name: f.name || f.content.name,
          actions: {
            copy: {name: 'Copy'},
            share: {name: 'Share'},
            delete: {name: 'Delete'},
            confirm: {name: 'Edit'}
          }
        },
        this.fragmentAction
      ])
    },
    fragmentAction (action, order) {
      this.$log('fragmentAction', action, order)
      switch (action) {
        case 'delete': {
          this.fragmentDelete(order)
          break
        }
        case 'confirm': {
          this.fragmentEditing = order
          break
        }
      }
    },
    async fragmentDelete (order) {
      this.$log('fragmentDelete', order)
      if (!order) return
      // this.$set(this.node.fragments, index, null)
      let i = this.fragmentsFilter.findIndex(f => f.order === order)
      this.$log('fragmentDelete index', i)
      await this.$wait(1000)
      this.$delete(this.node.fragments, i)
    },
    menuToggle () {
      this.$log('menuToggle')
      this.menuShow = !this.menuShow
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node || this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        this.node = res
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    },
    async nodePublishCheck () {
      this.$log('nodePublishCheck')
      let duration = this.node.fragments.reduce((acc, f) => {
        f.cuts.map(c => {
          acc += c.points[1].x - c.points[0].x
        })
        return acc
      }, 0)
      this.$log('duration', duration)
      if (duration > 120) {
        this.$q.notify({message: 'Too big fragments!', color: 'red', textColor: 'white'})
        throw new Error('Too big fragments')
      }
      if (this.node.fragments.length !== 2) {
        this.$q.notify({message: 'Need TWO fragment to Publis node', color: 'red', textColor: 'white'})
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        this.nodePublishCheck()
        await this.nodeSave()
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        this.nodePublishingError = null
        this.nodeStart()
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    },
    async nodePurge () {
      this.$log('nodePurge')
      this.nodePurging = true
      await this.$wait(600)
      let confirmed = confirm('Delete node?')
      if (confirmed) this.nodeStart()
      localStorage.removeItem('knode')
      this.nodePurging = false
    },
    nodeStart () {
      this.$log('nodeStart')
      this.node = JSON.parse(JSON.stringify(this.nodeNew))
      this.nodeVersion = 0
      this.nodeSpheresHeight = 50
      this.nodeSaving = false
      this.nodeSavingError = null
      this.nodePublishing = false
      this.nodePublishingError = null
      this.$nextTick(() => {
        if (this.$refs.nodeNameInput) this.$refs.nodeNameInput.focus()
      })
    },
    refresh () {
      this.$log('refresh')
      localStorage.removeItem('knode')
      window.location.reload(true)
    }
  },
  async mounted () {
    this.$log('mount START')
    // this.$q.notify('MOUNTED')
    this.$q.addressbarColor.set('white')
    document.body.style.background = 'white'
    // this.nodeStart()
    await this.$wait(500)
    // lsItem
    let lsItem = JSON.parse(localStorage.getItem('knode'))
    this.$log('lsItem', lsItem)
    // wsItem
    let wsItem = JSON.parse(JSON.stringify(this.$store.state.workspace.wsItem))
    this.$log('wsItem', wsItem)
    // shareItem
    let shareItem = JSON.parse(JSON.stringify(this.$store.state.core.shareData))
    // let shareItem = {text: 'https://www.youtube.com/watch?v=cocXKSEHbbo'}
    this.$log('shareItem', shareItem)
    // checks
    if (shareItem) {
      this.$q.notify('Using SHARE item!')
      if (lsItem) await this.nodeSave(lsItem)
      this.nodeStart()
      let shareUrl = shareItem.text || shareItem.url || shareItem.title
      // images & videos - массивы объектов File() https://developer.mozilla.org/ru/docs/Web/API/File
      if (shareUrl) {
        this.$log('shareUrl', shareUrl)
        this.$refs.fragmentFinder.urlUse(shareUrl)
      } else if (shareItem.images.length || shareItem.videos.length) {
        // todo использовать как фрагменты
      }
      this.$store.commit('core/stateSet', ['shareData', null])
    } else if (wsItem) {
      this.$q.notify('Using WS item!')
      if (lsItem) await this.nodeSave(lsItem)
      this.nodeStart()
      switch (wsItem.type) {
        case 'content': {
          this.fragmentFound(0, {
            name: '',
            cuts: [],
            content: wsItem.item,
            scale: wsItem.item.duration
          })
          break
        }
        case 'fragment': {
          this.fragmentFound(0, wsItem.item)
          break
        }
        case 'cut': {
          this.fragmentFound(0, wsItem.item)
          break
        }
        case 'node': {
          this.$set(this, 'node', wsItem.item)
          break
        }
      }
      this.$store.commit('workspace/stateSet', ['wsItem', null])
    } else {
      this.$q.notify('Using LS item!')
      if (lsItem) this.$set(this, 'node', lsItem)
    }
    this.$log('mount DONE')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  },
  async beforeRouteLeave (to, from, next) {
    this.$log('beforeRouteLeave')
    if (this.nodeSavePossible && this.nodeVersion > 1) {
      let confirmed = confirm('Save node to WS?!')
      if (confirmed) {
        await this.nodeSave()
      } else {
        localStorage.removeItem('knode')
      }
      next()
    } else {
      next()
    }
  }
}
</script>
