<template lang="pug">
  q-page.flex
    .kp-create
        content-creator(@create="showSelectContent")

        q-item
            q-item-section
                span.kp-create__sense-text Текст сути

        content-creator(@create="showSelectContent")

    .test
        q-btn(@click="gqlRefresh") TEST
        .test-1(v-for="(item, ix) in services()" :key="ix") {{ item.name }}&nbsp;
            a(:href="item.url") {{ item.url }}

    //select-content-dialog(:active="true" @close="mode = MODE_NONE")
    //select-content-dialog(:active="mode === MODE_SELECT_CONTENT" @close="mode = MODE_NONE")
</template>

<style lang="stylus">
    .kp-create
        display block
        width 100%
        text-align center
    .test
        text-align center
        display block
        width 100%
</style>

<script>
import ContentCreator from '../../components/create/ContentCreator';
import SelectContentDialog from '../../components/create/SelectContentDialog';
import { Auth } from '../../store/auth';

const MODE_NONE = 'mode.none';
const MODE_SELECT_CONTENT = 'mode.select-content';

export default {
  name: 'PageMobileCreate',
    components: { SelectContentDialog, ContentCreator },
    data() {
      return {
          mode: MODE_NONE,
          MODE_NONE,
          MODE_SELECT_CONTENT,
          response: {},
      };
    },
    methods: {
        showSelectContent() {
          this.mode = MODE_SELECT_CONTENT;
        },
        services() {
            return this.response;
        },
        gqlRefresh() {
            const request = {
                query: gql`query{
                    response: discoverServices {
                        name
                        url
                    }
                }`
            };

            const self = this;

            return new Promise((resolve) => {
                // const selfie = self;
                this.$apollo.subscribe(request).subscribe({
                    next: ({ data: { response } }) => {
                        self.response = response;
                        resolve(response);
                }
                })
            });
        },
        async test() {
            const auth = new Auth(this);
            const a = await auth.listServices();
            return a;
        },
    },
};
</script>
