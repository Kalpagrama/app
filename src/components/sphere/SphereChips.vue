<template lang="pug">
    .sphere-chips
        q-chip(v-for="(item, ix) in src" clickable :key="ix" @click="$emit('clicked', item.oid)")
            q-avatar
                img(:src='item.thumbUrl')
            span {{item.name || ' ???? ' }}
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'SphereChips',
        props: {
            parentOid: {
                type: [String, Boolean],
                default: '',
            }
        },
        data() {
            return {
                src: [],
            };
        },
        computed: {
            ...mapState('providers', { provider: state => state.sphere }),
        },
        beforeMount() {
            this.refresh();
        },
        methods: {
            refresh(oid) {
                this.provider.request(oid).then((data) => {
                    this.src = [];
                    if (Array.isArray(data)) {
                        data.forEach(el => this.src.push(el));
                    }
                });
            },
        },
    }
</script>
