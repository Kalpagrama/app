import { Node } from 'tiptap'
import { RxCollectionEnum } from 'src/system/rxdb'
import mainLayout from 'layouts/main_layout.vue'

export default class Iframe extends Node {
  get name() {
    return 'iframe'
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      parseDOM: [{
        tag: 'iframe',
        getAttrs: dom => ({
          src: dom.getAttribute('src'),
        }),
      }],
      toDOM: node => ['iframe', {
        src: node.attrs.src,
        frameborder: 0,
        allowfullscreen: 'true',
      }],
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'view'],
      components: {mainLayout},
      data () {
        return {
          nodeLite: null,
        }
      },
      computed: {
        src: {
          get() {
            return this.node.attrs.src
          },
          set(src) {
            this.updateAttrs({
              src,
            })
          },
        },
      },
      async mounted () {
        this.nodeLite = await this.$rxdb.get(RxCollectionEnum.OBJ, '79145195299586098')
      },
      template: `
        <div class="row full-width">
          <iframe class="row full-wdith" style="width: 100%; height: 400px" :src="src"></iframe>
          <div class="row full-width">
            <input class="full-width" @paste.stop type="text" v-model="src" v-if="view.editable" />
          </div>
          <div class="row full-width">
            <q-btn round flat color="green" icon="menu"/>
          </div>
          <div v-if="nodeLite" class="row full-width">
            <node-lite v-if="nodeLite" :node="nodeLite" :isActive="true" :isVisible="true"></node-lite>
          </div>
        </div>
      `,
    }
  }
}
