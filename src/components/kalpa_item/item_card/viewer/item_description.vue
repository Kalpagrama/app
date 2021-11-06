<template lang="pug">
.row.text-white {{item.providerInfo.description}}
</template>

<script>
import {assert} from 'src/system/common/utils'
import {ContentApi} from '../../../../api/content';

export default {
  name: 'itemDescription',
  props: ['item'],
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted() {
    this.$log('mounted')
    assert('providerInfo' in this.item && 'description' in this.item.providerInfo, 'description should be not null')
  }
}
</script>
