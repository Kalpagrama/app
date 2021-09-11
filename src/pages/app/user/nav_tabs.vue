<template lang="pug">
.row.full-width.items-start.justify-center.b-30
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`).row.full-width.items-start.q-px-md
    q-tabs(
      no-caps active-color="green" align="justify"
      stretch :breakpoint="100" inline-label
      dense
      :switch-indicator="true").full-width.text-grey-8
      q-route-tab(
        v-for="t in tabs" :key="t.id"
        @click="tabClick(t)"
        inline-label
        :to="t.id" :name="t.id" :label="t.name").q-px-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'navTabs',
  computed: {
    pages () {
      return [
        {id: 'nodes', name: this.$t('Nodes'), icon: 'panorama_fish_eye'},
        {id: 'joints', name: this.$t('Joints'), icon: 'panorama_fish_eye'},
        {id: 'blocks', name: this.$t('Essence blocks'), icon: 'panorama_fish_eye'},
        {id: 'votes', name: this.$t('Votes'), icon: 'adjust'},
      ]
    },
    query () {
      let objectTypes
      if (this.pageId === 'all') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else throw new Error('bad pageId: ' + this.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          oidSphere: this.sphere.oid,
          objectTypeEnum: { $in: objectTypes },
          // querySearch: this.searchString,
          sortStrategy: 'ACTIVITY' // 'ACTIVITY', // AGE
        },
        populateObjects: false,
        limit: 150
      }
    },
    tabs () {
      return [
        // {id: 'collections', name: this.$t('Collections'), icon: 'folder_special'},
        {id: 'nodes', name: this.$t('Nodes'), icon: 'panorama_fish_eye'},
        {id: 'joints', name: this.$t('Joints'), icon: 'panorama_fish_eye'},
        {id: 'blocks', name: this.$t('Essence blocks'), icon: 'panorama_fish_eye'},
        {id: 'votes', name: this.$t('Votes'), icon: 'adjust'},
      ]
    },
  },
  methods: {
    tabClick (t) {
      this.$log('tabClick', t)
      this.$store.commit('ui/stateSet', ['listFeedGoToStart', true])
    }
  },
}
</script>
