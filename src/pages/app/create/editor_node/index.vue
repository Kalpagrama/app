<template lang="pug">
div(style=`position: relative`).column.fit
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(style=`position: absolute; zIndex: 1000; bottom: 10px`).row.full-width.justify-center
      q-btn(rounded style=`height: 50px; width: 250px` color="primary" no-caps @click="nodeCreate()" :loading="nodeCreating") Опубликовать
  //- find spheres
  q-dialog(ref="showFindSpheres" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    findSpheres(v-if="showFindSpheres" @sphereAdd="sphereAdd" @close="$refs.showFindSpheres.hide()")
  //- .col
  //-   fragment(ref="fone")
  //- //- node name
  //- div(style="height: 57px").row.full-width
  //-   q-input(v-model="node.name" input-style=`fontSize: 18px`
  //-     :input-class="['text-center']" placeholder="В чем суть?").full-width
  //- .col
  //-   fragment(ref="ftwo")
  .row.bg-grey-3.q-pa-md
    node
      template(v-slot:actions_top)
        q-btn(dense round flat icon="clear" color="white")
        q-btn(round flat dense icon="edit" color="white")
      template(v-slot:actions_bottom)
        q-btn(dense round flat icon="clear" color="white")
        q-btn(round flat dense icon="edit" color="white")
  //- spheres
  div(style=`borderTop: 1px solid #eee; height: 50px`).row.full-width.items-center
    .col.full-height
      div(v-if="node.spheres.length === 0" @click="spheresFind").row.fit.items-center.hr.cursor-pointer
        span.text-grey-8.q-ml-md Добавь тэги
      div(v-else).row.fit.q-px-sm
        div(style=`maxWidth: 100%`).row.fit.items-center.bg-white.no-wrap.scroll
          div(v-for="(t, ti) in node.spheres" :key="ti" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-2
            span #
            span {{ t.name }}
            //- div(style=`height: 30px; width: 30px`)
            q-btn(icon="clear" @click="sphereDelete(t, ti)" dense flat round size="xs" color="black")
    q-btn(v-if="node.spheres.length < 4" flat round dense icon="add" color="primary" size="md" @click="spheresFind").q-mx-sm
</template>

<script>
import node from 'components/node'
import editorVideo from '../editor_video'
import fragment from './fragment'
import findSpheres from '../find_spheres'
export default {
  name: 'editorNode',
  components: {node, fragment, findSpheres, editorVideo},
  data () {
    return {
      node: {
        name: '',
        spheres: [],
        fragments: []
      },
      nodeCreating: false,
      showFindSpheres: false
    }
  },
  methods: {
    spheresFind () {
      this.$log('spheresFind')
      this.showFindSpheres = true
      this.$refs.showFindSpheres.show()
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      // TODO: add sphere? if this tag is unique? or valid?
      if (!this.node.spheres.find(sphere => sphere.name === s.anme)) {
        this.node.spheres.push(s)
      } else {
        this.$log('the SAME sphere', s)
      }
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete')
      this.node.spheres = this.node.spheres.filter(sphere => sphere.name !== s.name)
    },
    async nodeCreate () {
      try {
        this.$log('nodeCreate start', this.node)
        this.nodeCreating = true
        await this.$wait(3000)
        this.nodeCreating = false
        this.$router.push({name: 'home'})
        // // get contents
        // let contentOne = await this.$refs.fone.uploadContent()
        // let contentTwo = await this.$refs.ftwo.uploadContent()
        // // this.$log('contents', )
        // // mutate
        // let res = await this.$apollo.mutate({
        //   mutation: gql`
        //     mutation nodeCreate ($node: NodeInput!) {
        //       nodeCreate (node: $node) {
        //         oid
        //         type
        //         name
        //       }
        //     }
        //   `,
        //   variables: {
        //     node: {
        //       name: this.node.name,
        //       fragments: [contentOne, contentTwo],
        //       spheres: this.node.spheres
        //     }
        //   }
        // })
        // // done!
        // this.$log('nodeCreate', res)
        this.$log('nodeCreate done')
      } catch (e) {
        this.$log('nodeCreate error', e)
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
