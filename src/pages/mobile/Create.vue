<template lang="pug">
  q-page.flex
    .kp-create
        content-creator(@create="showSelectContent")

        q-item
            q-item-section
                span.kp-create__sense-text Текст сути

        content-creator(@create="showSelectContent")

    select-content-dialog(:active="true" @close="mode = MODE_NONE")
    //select-content-dialog(:active="mode === MODE_SELECT_CONTENT" @close="mode = MODE_NONE")
</template>

<style lang="stylus">
    .kp-create
        display block
        width 100%
        text-align center
</style>

<script>
import ContentCreator from '../../components/create/ContentCreator';
import SelectContentDialog from '../../components/create/SelectContentDialog';

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
      };
    },
    methods: {
        showSelectContent() {
          this.mode = MODE_SELECT_CONTENT;
        },
    },
};
</script>
