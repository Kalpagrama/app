<template lang="pug">
  q-page.flex
    .kp-create
        content-creator(@create="showSelectContent(0)" :item="items[0]")

        q-input.kp-create__sense-text(v-model="text" autogrow input-style="text-align: center;" label="Текст сути")

        content-creator(@create="showSelectContent(1)" :item="items[1]")

    select-content-dialog(:model="selectVisible" @close="closeDialog")
    //select-content-dialog(:active="mode === MODE_SELECT_CONTENT" @close="mode = MODE_NONE")

</template>

<style lang="stylus">
    .kp-create
        display block
        width 100%
        text-align center
        &__sense-text
            color currentColor
</style>

<script>
import ContentCreator from '../../components/create/ContentCreator';
import SelectContentDialog from '../../components/create/SelectContentDialog';

const MODE_NONE = 'mode.none';
const MODE_SELECT_CONTENT = 'mode.select-content';
const INDEX_NO_CONTENT = -1;

export default {
  name: 'PageMobileCreate',
    components: { SelectContentDialog, ContentCreator },
    data() {
      return {
          mode: MODE_NONE,
          selectVisible: false,
          response: {},
          targetContentIndex: INDEX_NO_CONTENT,
          text: '',
          items: [
              { videoId: null, imageSrc: null, },
              { videoId: null, imageSrc: null, },
          ],
      };
    },
    watch: {
      mode(val) {
          this.selectVisible = (val === MODE_SELECT_CONTENT);
      }
    },
    methods: {
        showSelectContent(index) {
          this.mode = MODE_SELECT_CONTENT;
          this.targetContentIndex = index;
        },
        services() {
            return this.response;
        },
        closeDialog(videoId) {
            this.items[this.targetContentIndex].videoId = videoId;
            this.targetContentIndex = INDEX_NO_CONTENT;
            this.mode = MODE_NONE;
        }
    },
};
</script>
