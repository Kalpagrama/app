import { UserRoleEnum } from 'src/api/user'
import { ObjectApi } from 'src/api/object'

let mixin = {
   computed: {
      actions () {
         let res = {
            copyLink: {
               name: this.$t('Copy Link'),
               cb: async () => {
                  this.$log('copyLink')
                  // alert('this.essence.oid: ' + this.essence.oid)
                  // TODO: handle copy link...
               }
            },
            // goThreads: {
            //   name: this.$t('Go threads'),
            //   cb: async () => {
            //     this.$log('goThreads')
            //     this.$router.push('/sphere-threads/' + this.essence.sphereFromName.oid)
            //   }
            // },
            // goGraph: {
            //   name: this.$t('Go graph'),
            //   cb: async () => {
            //     this.$log('goGraph')
            //     if (this.essence.items.length === 1) {
            //       this.$router.push(`/graph/${this.essence.oid}`)
            //     }
            //     else {
            //       this.$router.push(`/graph/${this.essence.items[0].oid}?oid=${this.essence.oid}`)
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
                  await ObjectApi.hide(this.essence.oid)
               }
            }
         }
         if (this.essenceIsMine || this.$store.getters.currentUser.profile.role.in(UserRoleEnum.MODERATOR, UserRoleEnum.ADMIN)) {
            res.delete = {
               name: this.$t('Delete'),
               color: 'red',
               cb: async () => {
                  this.$log('essenceDelete...')
                  await ObjectApi.unPublish(this.essence.oid)
               }
            }
         } else {
            res.hide = {
               name: this.$t('Hide'),
               color: 'white',
               cb: async () => {
                  this.$log('hide...')
                  // await this.$rxdb.hideObjectOrSource(this.essence.oid, null)
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
            this.essence.hasChanges &&
            this.essence.type === 'BLOCK' &&
            (
               this.essence.author.oid === this.$store.getters.currentUser.oid ||
               this.essence.members.find(m => m.oid === this.$store.getters.currentUser.oid)
            )
         ) {
            res.update = {
               name: this.$t('Update'),
               color: 'green',
               cb: async () => {
                  this.$log('essenceUpdate...')
                  await ObjectApi.blockUpdate(this.essence)
               }
            }
         }
         return res
      }
   }
}

export { mixin }
