import { i18n } from 'boot/i18n'
import { Notify } from 'quasar'
import { router } from 'boot/main'
export default async ({ Vue, store, router: VueRouter }) => {
  Vue.prototype.$knotify = (type, message, icon) => {
    let object = event.object
    switch (type) {
      case 'error': {
        this.$q.notify({message, icon, position: 'bottom'})
        break
      }
      case 'notification': {
        Notify.create(
          {
            message: message,
            color: 'white',
            textColor: 'white',
            icon: '',
            multiLine: false,
            position: 'top',
            actions: [{
              label: i18n.t('GO'),
              noDismiss: true,
              color: 'green',
              handler: () => {
                // app/workspace/fragments
                let route = '/'
                if (['AUDIO', 'BOOK', 'FRAME', 'IMAGE', 'VIDEO'].includes(object.type)) {
                  route = `/content/${object.oid}`
                } else if (['NODE'].includes(object.type)) {
                  route = `/node/${object.oid}`
                } else if (['SPHERE', 'WORD', 'SENTENCE', 'CHAR'].includes(object.type)) {
                  route = `/sphere/${object.oid}`
                } else {
                  throw new Error(`bad object ${JSON.stringify(object)}`)
                }
                // else if (['WSBookmark', 'WSSphere', 'WSContent', 'WSNode', 'WSFragment'].includes(object.__typename)) {
                //   if (object.__typename === 'WSBookmark') {
                //     route = '/app/workspace/bookmarks'
                //   } else if (object.__typename === 'WSSphere') {
                //     route = '/app/workspace/spheres'
                //   } else if (object.__typename === 'WSContent') {
                //     route = '/app/workspace/contents'
                //   } else if (object.__typename === 'WSNode') {
                //     route = '/app/workspace/nodes'
                //   } else if (object.__typename === 'WSFragment') route = '/app/workspace/fragments'
                // }
                router.push(route)
              }
            }]
          })
        break
      }
    }
  }
}
