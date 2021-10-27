<template lang="pug">
  .row.justify-start.full-width.q-pt-md
    .col
    span {{$t('Сохранить в коллекцию')}}
    .col
    q-btn(flat icon="add" dense no-caps color="green" @click="showMenu=true").q-mr-md
      q-dialog(v-model="showMenu" transition-show="flip-up" transition-hide="flip-down" :content-style=`{borderRadius: '10px', background: 'rgba(40,40,40,0.7)'}`)
        div(
          :style=`{ borderRadius: '10px', color: 'white', border: '2px solid rgb(76,175,79)', paddingLeft: '10px', background: 'rgba(40,40,40)'}`
        ).row.full-width
          q-input(v-model="newCollectionName", autofocus, borderless dark :placeholder="$t('New collection')" @keyup.enter="createCollection(true)").col.full-width
          q-btn(v-close-popup round flat :color="newCollectionName ? 'green' : null", icon="add", :disable="!newCollectionName" @click="createCollection(true)")
    //div(v-for="(c,ci) in value.collections" :key="c.id").col.full-width.br.wrap
    div(:style=`{maxHeight: '180px'}`).row.scroll.full-width
      q-chip(
        v-for="(c,ci) in value.collections" :key="c.id"
        no-caps clickable text-color="white" outline
        :color="value.selectedCollectionIds.includes(c.id) && highlightSelected? 'green' : 'grey-8'"
        @click="addRemoveCollection(c)"
      ).q-pl-sm
        div(:style=`{maxWidth: $q.screen.width > $store.state.ui.pageMinWidthDesktop ? '500px' : '250px', fontSize: '12px'}`).ellipsis {{ c.name }}
        q-btn(v-if="showDeleteButton" round flat no-caps :icon="c.id=='all' ? null : 'clear'" color= "red" @click="removeCollection(c.id)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import {assert} from 'src/system/common/utils'

export default {
  name: 'collectionList',
  props: {
    value: {type: Object, required: true},
    highlightSelected: {type: Boolean, default: true},
    showDeleteButton: {type: Boolean, default: true},
    showAllCollection: {type: Boolean, default: true},
  },
  data () {
    return {
      collectionsRes: null,
      showMenu: false,
      newCollectionName: ''
    }
  },
  watch: {
    'collectionsRes.items': {
      handler (to, from) {
        if (to) {
          const collectionAll = {
            id: 'all',
            name: this.$t('All')
          }
          this.value.collections = (this.showAllCollection ? [collectionAll, ...this.collectionsRes.items] : this.collectionsRes.items)
          // this.value.collections.splice(0, this.value.collections.length, ...[collectionAll, ...this.collectionsRes.items])
          // this.$set(this.value, 'collections', [collectionAll, ...this.collectionsRes.items])
        }
      }
    }
  },
  computed: {
    queryCollections () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION
        },
        sort: [{ createdAt: 'desc' }]
      }
      return res
    },
  },
  methods: {
    addRemoveCollection(c) {
      let indx = this.value.selectedCollectionIds.findIndex(id => c.id === id)
      if (indx >= 0) this.value.selectedCollectionIds.splice(indx, 1)
      else this.value.selectedCollectionIds.push(c.id)
    },
    async createCollection (add = false) {
      assert(this.newCollectionName)
      let collectionInput = {
        name: this.newCollectionName
      }
      let newCollection = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
      this.value.collectionId = newCollection.id
      this.newCollectionName = ''
      this.$emit('collection-select', this.value.collectionId)
      this.showMenu = false
      if (add) this.addRemoveCollection(newCollection)
      return this.value.collectionId
    },
    async removeCollection (id) {
      await this.$rxdb.remove(id)
      if (id === this.value.collectionId) this.value.collectionId = 'all'
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value })
    },
  },
  async mounted () {
    this.$log('mounted')
    this.collectionsRes = await this.$rxdb.find(this.queryCollections)
    // this.$set(this.value, 'collectionId', this.collectionsRes.items.length ? this.collectionsRes.items[0].id : 'all')
    this.value.collectionId = this.value.collectionId || 'all'
  }
}
</script>
