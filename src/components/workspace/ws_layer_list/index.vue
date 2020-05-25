<style lang="sass">
</style>

<template lang="pug">
.column.fit.q-pt-sm
  //- header
  div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Content layers
    div.row.full-width.q-px-sm
      input(
        v-model="searchString"
        placeholder="Search").full-width.b-70.k-input
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      q-btn(flat no-caps color="white").b-70 Filters
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md
      kalpa-loader(type="WS_CONTENT" :variables="variables")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            content-item(
              v-for="(c,ci) in items" :key="ci"
              :content="c" :contentIndex="ci")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white Nothing found :(
</template>

<script>
import contentItem from './content_item'

export default {
  name: 'wsLayers',
  components: {contentItem},
  data () {
    return {
      type: 'VIDEO',
      types: [
        {id: 'all', name: 'All'},
        {id: 'VIDEO', name: 'Video'},
        {id: 'IMAGE', name: 'Images'},
        {id: 'BOOK', name: 'Books'}
      ],
      searchString: ''
    }
  },
  computed: {
    variables () {
      let res = {selector: {}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      if (this.type !== 'all') {
        res.selector.contentType = this.type
      }
      return res
    }
  }
}
</script>
