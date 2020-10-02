<style lang="stylus" scoped>
.link-item
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px',overflow: 'hidden'}`).row.full-width.b-40
        .col
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark dense color="white"
              :placeholder="$t('Find a link', 'Найти связь')"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
        q-btn(
          @click="$router.push('/workspace/link/new')"
          round flat dense color="green" icon="add"
          :style=`{width: '40px'}`)
    //- types
    //- TODO: what are link types?
    //- types
    //- div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeIdChanged" inline-label
        dense no-caps active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        q-tab(name="saved" icon="bookmark")
        q-tab(name="drafts" label="Drafts")
        q-tab(name="published" label="Published")
    //- links
    .row.full-width.items-start.content-start.q-pt-sm
      kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000"
        v-slot=`{items,next}`)
        masonry(
          :cols="3"
          :gutter="{default: 6}").full-width.q-pr-sm
          div(
            v-for="(link, li) in items" :key="link.id"
            :style=`{
              position: 'relative',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.q-mb-md.b-40.cursor-pointer.link-item
            //- default
            div(
              @click="linkSelectedId === link.id ? linkSelectedId = null : linkSelectedId = link.id"
              :style=`{
                position: 'relative', zIndex: 10,
                borderRadius: '10px', overflow: 'hidden'
              }`
              ).row.full-width.link-item.b-40
              //- items wrapper
              .row.full-width
                div(v-for="(i,ii) in link.items" :key="ii").col-6
                  .row.full-width.justify-center.q-pa-xs
                    img(
                      v-if="i.item.thumbUrl"
                      draggable="false"
                      :src="i.item.thumbUrl"
                      :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
                    .row.full-width.justify-center.q-pa-xs
                      small.text-white {{ i.item.name.slice(0, 40) }}
              .row.full-width.justify-center.q-pa-sm
                span.text-bold.text-white {{ link.name }}
            slot(name="tint" :item="link" :itemKey="link.id")
            //- selected
            div(
              v-if="link.id === linkSelectedId"
              :style=`{
                position: 'relative',
                marginTop: '-10px', paddingTop: '14px',
                borderRadius: '0 0 10px 10px', overflow: 'hidden',
              }`
              ).row.full-width.bg-green.q-px-xs.q-pb-xs
              q-btn(round flat dense color="green-8" icon="delete_outline" @click="linkDelete(link,li)")
              .col
              q-btn(round flat dense color="white" icon="edit" @click="linkEdit(link,li)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsLinks',
  data () {
    return {
      searchString: '',
      linkSelectedId: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_JOINT,
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async linkDelete (link, ii) {
      this.$log('linkDelete', link, ii)
      this.$q.dialog({
        dark: true,
        title: 'Удалить ?!',
        // message: 'Это нельзя отменить',
        persistent: true,
        'content-style': { borderRadius: '10px', overflow: 'hidden' },
        ok: { flat: false, color: 'green', label: 'Удалить', 'no-caps': true },
        cancel: { flat: true, color: 'green', label: 'Отмена', 'no-caps': true },
      }).onOk(async () => {
        await this.$rxdb.remove(link.id)
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    },
    linkEdit (link, ii) {
      this.$log('linkEdit', link, ii)
      this.$router.push(`/workspace/link/${link.id}`).catch(e => e)
    }
  }
}
</script>
