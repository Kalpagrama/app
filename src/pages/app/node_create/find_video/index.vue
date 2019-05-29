<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(:style=`{height: headerHeight+'px', borderBottom: '1px solid #eee'}`).column.full-width
    //- header
    div(v-if="bodyType === 'device'" style=`height: 60px`).row.full-width.items-center.justify-end
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
    //- body
    .col
      .row.fit.items-center.content-center
        .row.full-width
          .col.q-pl-sm
            q-input(v-model="search" filled placeholder="Search video or paste a video link" @click="searchClick"
              :class="{'q-pr-sm': bodyType === 'device'}").fit
              template(v-slot:prepend)
                q-icon(name="search")
          div(v-if="bodyType === 'list'" style=`height: 60px; width: 60px`).row.items-center.justify-center
            q-btn(flat round icon="clear" @click="cancelClick" color="primary")
        div(v-if="bodyType === 'device'").row.full-width.justify-center
          small.text-center.text-grey-8.q-my-sm Search a video or paste a video link from YouTube or VK
  //- videos list
  div(v-if="showVideoList").col.scroll.bg-grey-2
    list(v-if="bodyType === 'list'" :items="items" :fake="true" @itemClick="itemClick")
    device(v-if="bodyType === 'device'")
</template>

<script>
// import { animate } from 'quasar'
import list from './list'
import device from './device'
export default {
  name: 'findVideo',
  components: { list, device },
  data () {
    return {
      headerHeight: this.$store.state.ui.width,
      search: '',
      bodyType: 'device',
      bodyTypes: ['device', 'list'],
      items: []
    }
  },
  methods: {
    itemClick (item) {
      this.$log('itemClick', item)
    },
    cancelClick () {
      this.$log('cancelClick')
      this.bodyType = 'device'
      var interval = setInterval(() => {
        if (this.headerHeight < this.$store.state.ui.width) this.headerHeight = this.headerHeight + 3
        else clearInterval(interval)
      }, 1)
    },
    searchClick () {
      this.$log('searchClick')
      // TODO: animation with quasar??
      // this.headerHeight = 70
      this.bodyType = 'list'
      var interval = setInterval(() => {
        if (this.headerHeight > 70) this.headerHeight = this.headerHeight - 3
        else clearInterval(interval)
      }, 1)
      // animate.start({
      //   from: this.headerHeight,
      //   to: 70,
      //   duration: 300,
      //   apply (pos) {
      //     this.headerHeight = pos
      //   },
      //   done () {
      //     this.$log(`we're done!`)
      //   }
      // })
    }
  },
  // watch: {},
  computed: {
    showVideoList () {
      // TODO: depends on the platform what to show
      // on cordova we ask permission to see videos from
      return true
    }
  },
  mounted () {
    this.$log('mounted')
    // TODO: it can be aggregator from any source, youtube, vk or device
    // load popular videos of what??? at the beginning
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
