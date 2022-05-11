import { UserRoleEnum } from 'src/api/user'
import { ObjectApi } from 'src/api/object'

let mixin = {
   computed: {
      itemForAction() {
         return this.essence || this.node
      },
      actions () {
         let res = {
            copyLink: {
               name: this.$t('Copy Link'),
               cb: async () => {
                  this.$log('copyLink')
                  // alert('this.itemForAction.oid: ' + this.itemForAction.oid)
                  // TODO: handle copy link...
               }
            },
            // goThreads: {
            //   name: this.$t('Go threads'),
            //   cb: async () => {
            //     this.$log('goThreads')
            //     this.$router.push('/sphere-threads/' + this.itemForAction.sphereFromName.oid)
            //   }
            // },
            // goGraph: {
            //   name: this.$t('Go graph'),
            //   cb: async () => {
            //     this.$log('goGraph')
            //     if (this.itemForAction.items.length === 1) {
            //       this.$router.push(`/graph/${this.itemForAction.oid}`)
            //     }
            //     else {
            //       this.$router.push(`/graph/${this.itemForAction.items[0].oid}?oid=${this.itemForAction.oid}`)
            //     }
            //   }
            // }
         }
         // if (this.$store.getters.isGuest) {
         //   return res
         // }
         if (this.$store.getters.currentUser.profile.role.in(UserRoleEnum.MODERATOR, UserRoleEnum.ADMIN)) {
            res.hideGlobal = {
               name: this.$t('hide global'),
               color: 'red',
               cb: async () => {
                  this.$log('hideGlobal...')
                  await ObjectApi.hide(this.itemForAction.oid)
               }
            }
         }
         if (this.essenceIsMine || this.$store.getters.currentUser.profile.role.in(UserRoleEnum.MODERATOR, UserRoleEnum.ADMIN)) {
            res.delete = {
               name: this.$t('Delete'),
               color: 'red',
               cb: async () => {
                  this.$log('essenceDelete...')
                  await ObjectApi.unPublish(this.itemForAction.oid)
               }
            }
         } else {
            res.hide = {
               name: this.$t('Hide'),
               color: 'white',
               cb: async () => {
                  this.$log('hide...')
                  // await this.$rxdb.hideObjectOrSource(this.itemForAction.oid, null)
                  this.data.hideShow = true
               }
            }
            res.report = {
               name: this.$t('Report'),
               color: 'red',
               cb: () => {
                  this.$log('report...')
                  // let reason = prompt(this.$t('Why?'))
                  this.data.reportShow = true
               }
            }
         }
         if (
            this.itemForAction.hasChanges &&
            this.itemForAction.type === 'BLOCK' &&
            (
               this.itemForAction.author.oid === this.$store.getters.currentUser.oid ||
               this.itemForAction.members.find(m => m.oid === this.$store.getters.currentUser.oid)
            )
         ) {
            res.update = {
               name: this.$t('Update'),
               color: 'green',
               cb: async () => {
                  this.$log('essenceUpdate...')
                  await ObjectApi.blockUpdate(this.itemForAction)
               }
            }
         }
         return res
      }
   }
}

export { mixin }
