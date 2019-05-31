<template lang="pug">
.row.fit
  div(v-if="$q.platform.is.cordova").row.fit
    span Give me access to see your photos, please
  div(v-else @click="$refs.kimage.click()").row.fit.items-center.content-center.justify-center
    input(type="file" hidden ref="kimage"  @change="imageChanged")
    .row.full-width.justify-center
      q-icon(name="add_photo_alternate" size="100px" color="primary")
    .row.full-width.justify-center
      span или выбери с {{ deviceType }}
</template>

<script>
import { Platform } from 'quasar'

export default {
  name: 'findVideo_Local',
  data () {
    return {
    }
  },
  methods: {
    imageChanged (e) {
      this.$log('imageChanged', e)
      // this.photoFile = e.target.files[0]
      // this.showAddBtn = false
      // this.photoUrl = URL.createObjectURL(this.photoFile)
    }
  },
  computed: {
    deviceType () {
      if (Platform.is.desktop) {
        return `компьютера`
      } else {
        return `телефона`
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
