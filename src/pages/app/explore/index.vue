<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.items-center.bg-white.q-px-md
      span {{$t('explore')}}
  .col.scroll
    video(:src="src" width="640px" height="360px" type="video/mp4" autoplay)
</template>

<script>
export default {
  name: 'pageApp__Explore',
  meta: {
    title: 'Kalpa - Explore'
  },
  data () {
    return {
      src: '',
      srcIndex: 0,
      srcs: [
        'https://storage.yandexcloud.net/kalpa-fragments/ae/z/122786787771851331/184.9999994-267.93999989999963_600.mp4',
        'https://storage.yandexcloud.net/kalpa-fragments/ge/44/122788948786324036/21.1199998-201.1199997999997_600.mp4',
        'https://storage.yandexcloud.net/kalpa-fragments/so/c7/122845204985193031/101.252164-157.21875_600.mp4',
        'https://storage.yandexcloud.net/kalpa-fragments/q9/wm/122844330187596358/129.388301-217.40625_600.mp4',
        'https://storage.yandexcloud.net/kalpa-fragments/sc/us/108394685759791108/136.40625-149.625_600.mp4',
        'https://storage.yandexcloud.net/kalpa-fragments/yw/8e/123223286929728078/64.40625-159.06_600.mp4'
      ]
    }
  },
  mounted () {
    this.$log('mounted')
    // this.src = this.srcs[this.srcIndex]
    setInterval(() => {
      if (this.srcIndex === this.srcs.length - 1) {
        this.srcIndex = 0
      } else {
        this.srcIndex += 1
      }
      this.src = this.srcs[this.srcIndex]
    }, 2000)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
