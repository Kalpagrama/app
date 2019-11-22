<template lang="pug">
q-layout(:container="true" :style=`{width: width+'px', height: height+'px'}`).bg-grey-3
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.items-center.bg-white
      div(:style=`{height: '60px', width: '60px'}` @click="$refs.sMenu.toggle()").row.items-center.justify-center
        q-btn(round flat color="black" icon="menu")
      .col.full-height
        .row.fit.items-center
          span.text-bold.text-black Настройки
  q-drawer(ref="sMenu" side="left" :width="250")
    div(:style=`{width: '200px'}`).row.full-height.items-start.content-start.bg-grey-1
      div(
        v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
        :style=`{height: '50px'}`
        ).row.full-width.items-center.cursor-pointer.q-px-md
          span(:style=`{color: pkey === page ? 'green' : 'black'}`) {{ p.name }}
  q-page-container
    q-page
      div(:style=`{height: height-60+'px'}`).row
        .col.full-height
          general(v-if="page === 'general'")
          payments(v-if="page === 'payments'")
          privacy(v-if="page === 'privacy'")
          security(v-if="page === 'security'")
          notifications(v-if="page === 'notifications'")
          //- div(v-else).row.fit.items-center.justify-center
            span.text-bold 404
</template>

<script>
import general from './general'
import payments from './payments'
import privacy from './privacy'
import security from './security'
import notifications from './notifications'
export default {
  name: 'pageApp__settings',
  components: {general, payments, privacy, security, notifications},
  props: ['width', 'height'],
  data () {
    return {
      page: 'general',
      pages: {
        general: {name: 'Основные'},
        security: {name: 'Безопасность'},
        privacy: {name: 'Приватность'},
        notifications: {name: 'Уведомления'},
        payments: {name: 'Платежи и подписки'}
      }
    }
  },
  methods: {
    pageClick (p, pkey) {
      this.$log('pageClick', p, pkey)
      this.page = pkey
    }
  }
}
</script>
