<template lang="pug">
//- div(
  v-if="audioPlayer.audio"
  :style=`{
    width: '320px',
    borderRadius: '20px',
    background: 'white',
  }`
  ).row.items-center.content-center.q-pa-md
  div().row.full-width.justify-center
    q-btn(round flat color="green" icon="skip_previous" @click="nextAudio(-1)")
    q-btn(round flat color="green" icon="replay_5" @click="seekAudio(-5)")
    q-btn(round flat color="green" :icon="audioPlayer.isPlaying ? 'pause' : 'play_arrow'" @click="audioPlayer.isPlaying ? pauseAudio() : playAudio()")
    q-btn(round flat color="green" icon="forward_5" @click="seekAudio(5)")
    q-btn(round flat color="green" icon="skip_next" @click="nextAudio(1)")
    q-btn(round flat color="green" icon="close" @click="destroyAudio()")
  div().row.full-width.justify-center
    q-select(outlined v-model="audioPlayer.system" :options="audioPlayer.systems" label="system")
    q-select(outlined v-model="audioPlayer.voice" :options="audioPlayer.voices[audioPlayer.system]" label="voice")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { EpubCFI } from 'epubjs'
import {assert} from 'src/system/utils'
import { ContentApi } from 'src/api/content'
import debounce from 'lodash/debounce'

export default {
  name: 'playerAudio',
  data () {
    return {
      audioPlayer: {
        system: 'google',
        voice: 'ru-RU-Standard-D',
        systems: ['google', 'yandex'],
        voices: {
          yandex: ['zahar', 'oksana', 'jane', 'omazh', 'ermil', 'alena', 'filipp'],
          google: ['ru-RU-Standard-D', 'ru-RU-Standard-A', 'ru-RU-Standard-B', 'ru-RU-Standard-C', 'ru-RU-Standard-E']
        },
        audio: null,
        isPlaying: false,
        currentSectionHref: null, // текущая секция книги(обычно глава) (Данные подгружаются для каждой главы отдельно)
        paragraphs: [], // [{epubCfi, epubCfiText}] список абзацев (для озвучки)
        currentParagraphIndx: -1, // проигрываемый абзац
        findCutsRes: [] // озвученные куски книги
      }
    }
  },
  watch: {
    'audioPlayer.system': {
      handler (to, from) {
        if (to) this.audioPlayer.voice = this.audioPlayer.voices[to][0]
      }
    }
  },
  methods: {
    async playAudio () {
      this.audioPlayer.isPlaying = true
      if (this.audioPlayer.audio) { // играем текущий
        this.audioPlayer.audio.play()
      } else {
        await this.nextAudio(1)
      }
    },
    pauseAudio () {
      this.audioPlayer.isPlaying = false
      if (this.audioPlayer.audio) this.audioPlayer.audio.pause()
    },
    seekAudio (sec) {
      if (this.audioPlayer.audio) this.audioPlayer.audio.currentTime += sec
    },
    highlightCurrentParagraphAudio (currentParagraph) {
      if (this.audioPlayer.currentParagraphIndx >= 0) { // удалим старое выделение
        let oldParagraph = this.audioPlayer.paragraphs[this.audioPlayer.currentParagraphIndx]
        this.rendition.annotations.remove(oldParagraph.epubCfi, 'highlight')
      }
      if (currentParagraph) {
        this.audioPlayer.currentParagraphIndx = this.audioPlayer.paragraphs.findIndex(p => p.epubCfi === currentParagraph.epubCfi)
        this.rendition.annotations.highlight(currentParagraph.epubCfi, {}, async (e) => {
          this.$logE('highlight clicked', currentParagraph.epubCfi)
        }, undefined, {
          fill: 'green',
          'fill-opacity': '0.5',
          'mix-blend-mode': 'multiply'
        })
        this.goToCfi(currentParagraph.epubCfi)
      } else this.audioPlayer.currentParagraphIndx = -1
    },
    destroyAudio () {
      this.pauseAudio()
      this.highlightCurrentParagraphAudio(null)
      this.audioPlayer.audio = null
    },
    async nextAudio (step = 1, fromCurrentSelection = false) {
      let currentParagraph
      if (fromCurrentSelection) { // ищем параграф, пересекающийся с выделением
        assert(this.lastAnnotation.cfiRange, '!!bad this.lastAnnotation.cfiRange!')
        for (let { epubCfi, epubCfiText, cuts } of this.audioPlayer.paragraphs) {
          let paragraphCfiStart, paragraphCfiEnd, selectedCfiStart, selectedCfiEnd
          paragraphCfiStart = new EpubCFI(epubCfi)
          paragraphCfiStart.collapse(true)
          paragraphCfiEnd = new EpubCFI(epubCfi)
          paragraphCfiEnd.collapse(false)
          selectedCfiStart = new EpubCFI(this.lastAnnotation.cfiRange)
          selectedCfiStart.collapse(true)
          selectedCfiEnd = new EpubCFI(this.lastAnnotation.cfiRange)
          selectedCfiEnd.collapse(false)
          // a.start <= b.end AND a.end >= b.start
          let one = (new EpubCFI()).compare(paragraphCfiStart, selectedCfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          let two = (new EpubCFI()).compare(paragraphCfiEnd, selectedCfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          if (one <= 0 && two >= 1) { // пересекаются
            currentParagraph = { epubCfi, epubCfiText, cuts }
            break
          }
        }
        if (!currentParagraph) return await this.nextAudio(0) // проиграем сначала
        // this.clearSelection()
      } else { // играем след параграф
        currentParagraph = this.audioPlayer.paragraphs[Math.max(0, this.audioPlayer.currentParagraphIndx + step)]
      }
      this.highlightCurrentParagraphAudio(currentParagraph)
      if (currentParagraph) {
        let currentCut = currentParagraph.cuts.find(c => c.params.system === this.audioPlayer.system && c.params.voice === this.audioPlayer.voice)
        if (!this.audioPlayer.nextInternal) {
          this.audioPlayer.nextInternal = debounce(async (currentCut, currentParagraph) => {
            if (!currentCut) { // просим сервер создать новый кат
              currentCut = await ContentApi.contentCutCreate(this.contentKalpa.oid, currentParagraph.epubCfi, currentParagraph.epubCfiText, {
                system: this.audioPlayer.system,
                voice: this.audioPlayer.voice
              })
              currentParagraph.cuts.push(currentCut)
            }
            this.pauseAudio()
            this.audioPlayer.audio = new Audio(currentCut.urlWithFormats.length ? currentCut.urlWithFormats[0].url : null)
            this.audioPlayer.audio.addEventListener('ended', async (event) => {
              if (this.audioPlayer.isPlaying) {
                await this.nextAudio(1)
              }
            })
            await this.playAudio()
          }, 1000)
        }
        this.audioPlayer.nextInternal(currentCut, currentParagraph)
      }
    },
    async prepareAudioPlayer (location) {
      const makeRangeCfi = (a, b) => {
        const CFI = new EpubCFI()
        const start = CFI.parse(a)
        const end = CFI.parse(b)
        start.base.steps = start.base.steps.filter(step => step)
        end.base.steps = end.base.steps.filter(step => step)
        start.path.steps = start.path.steps.filter(step => step)
        end.path.steps = end.path.steps.filter(step => step)
        const cfi = {
          range: true,
          base: start.base,
          path: {
            steps: [],
            terminal: null
          },
          start: start.path,
          end: end.path
        }
        const len = cfi.start.steps.length
        for (let i = 0; i < len; i++) {
          if (CFI.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
            if (i === len - 1) {
              // Last step is equal, check terminals
              if (cfi.start.terminal === cfi.end.terminal) {
                // CFI's are equal
                cfi.path.steps.push(cfi.start.steps[i])
                // Not a range
                cfi.range = false
              }
            } else cfi.path.steps.push(cfi.start.steps[i])
          } else break
        }
        cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length)
        cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length)
        let z = CFI.segmentString(cfi.base)
        let x = CFI.segmentString(cfi.path)
        let c = CFI.segmentString(cfi.start)
        let v = CFI.segmentString(cfi.end)

        return 'epubcfi(' + CFI.segmentString(cfi.base) + '!' + CFI.segmentString(cfi.path) + ',' + CFI.segmentString(cfi.start) + ',' + CFI.segmentString(cfi.end) + ')'
      }
      // вернет главы, попавшие в диапазон cfiStart, cfiEnd
      let getChapters = async (cfiStart, cfiEnd) => {
        // for (let chapter of this.toc){
        //   return chapter.subitems
        // }
        // список наимельчайших глав
        let getLowestChapters = (chapter) => {
          let res = []
          if (chapter.subitems && chapter.subitems.length) {
            for (let subchapter of chapter.subitems) {
              res.push(...getLowestChapters(subchapter))
            }
          } else res.push(chapter)
          return res
        }
        let chapters = [] // список всех глав (если в главе есть подглавы, то выводятся ТОЛЬКО подглавы)
        for (let chapter of this.toc) {
          chapters.push(...getLowestChapters(chapter))
        }
        let innerChapterIndexes = []

        // // todo не обрабатывается последняя глава
        // for (let i = 1; i < chapters.length; i++){
        //   let prevSection = this.book.spine.get(chapters[i - 1].href)
        //   let nextSection = this.book.spine.get(chapters[i].href)
        //   let contentsPrev = await prevSection.load(this.book.load.bind(this.book))
        //   let contentsNext = await nextSection.load(this.book.load.bind(this.book))
        //   let cfiChapterPrev = new EpubCFI(prevSection.cfiFromElement(prevSection.document.firstElementChild))
        //   let cfiChapterNext = new EpubCFI(nextSection.cfiFromElement(nextSection.document.firstElementChild))
        //   let start = cfiChapterPrev
        //   let end = cfiChapterNext
        //   // a.start <= b.end AND a.end >= b.start
        //   let one = (new EpubCFI()).compare(cfiStart, end) // First is earlier = -1, Second is earlier = 1, They are equal = 0
        //   let two = (new EpubCFI()).compare(cfiEnd, start) // First is earlier = -1, Second is earlier = 1, They are equal = 0
        //   if (one <= 0 && two >= 1){ // пересекаются
        //     let rangeCfi = makeRangeCfi(start.str, end.str)
        //     let range = await this.book.getRange(rangeCfi)
        //     this.$log('range=', range)
        //     this.$log('range text =', range.toString())
        //     this.$log('range text =', range.toString())
        //   }
        // }
        // ищем те главы, начала которых попали непосредственно в диапазон
        for (let i = 0; i < chapters.length; i++) {
          assert(chapters[i].href, '!href')
          let section = this.book.spine.get(chapters[i].href)
          let contents = await section.load(this.book.load.bind(this.book))
          let cfiChapter = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
          let startRes = (new EpubCFI()).compare(cfiChapter, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          let endRes = (new EpubCFI()).compare(cfiChapter, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
          if (startRes >= 0 && endRes <= 0) { // начало главы попало в диапазон
            innerChapterIndexes.push(i)
          }
        }
        // добавим главы, НАЧИНАЮЩИЕСЯ слева и справа от диапазона
        for (let i = 1; i < chapters.length; i++) {
          let prevSection = this.book.spine.get(chapters[i - 1].href)
          let nextSection = this.book.spine.get(chapters[i].href)
          let contentsPrev = await prevSection.load(this.book.load.bind(this.book))
          let contentsNext = await nextSection.load(this.book.load.bind(this.book))
          let cfiChapterPrev = new EpubCFI(prevSection.cfiFromElement(prevSection.document.firstElementChild))
          let cfiChapterNext = new EpubCFI(nextSection.cfiFromElement(nextSection.document.firstElementChild))
          {
            let startResPrev = (new EpubCFI()).compare(cfiChapterPrev, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            let startResNext = (new EpubCFI()).compare(cfiChapterNext, cfiStart) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            if (startResPrev < 0 && startResNext >= 0) { // prev - до диапазона, next - в диапазоне либо после него
              innerChapterIndexes.push(i - 1) // добавляем prev
            }
          }
          {
            let endResPrev = (new EpubCFI()).compare(cfiChapterPrev, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            let endResNext = (new EpubCFI()).compare(cfiChapterNext, cfiEnd) // First is earlier = -1, Second is earlier = 1, They are equal = 0
            if (endResNext > 0 && endResPrev <= 0) { // next - после диапазона, prev - в диапазоне либо до него
              innerChapterIndexes.push(i) // добавляем next
              break
            }
          }
        }
        let result = []
        for (let i of innerChapterIndexes) {
          let chapter = chapters[i]
          // todo  надо получить chapter rangeCFI и отсечь те, что не пересекаются с cfiStart, cfiEnd
          // let sectionChapter = await this.book.section(chapter.href)
          let sectionChapter = this.book.spine.get(chapter.href)
          this.$log('chapter=', chapter)
          this.$log('sectionChapter=', sectionChapter)
          let section = sectionChapter
          let contents = await section.load(this.book.load.bind(this.book))
          let cfiBase = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
          this.$log('contents=', contents)
          this.$log('cfiBase=', cfiBase)
          this.$log('doc=', section.document)
          result.push(chapter)
        }
        return result
      }
      // let chapters = await getChapters(location.start.cfi, location.end.cfi)
      // for (let chapter of chapters){
      //   this.$log(chapter)
      //   let sectionChapter = await this.book.section(chapter.href)
      //   this.$log(chapter, sectionChapter)
      //   let section = sectionChapter
      //   let contents = await section.load(this.book.load.bind(this.book))
      //   let cfiBase = new EpubCFI(section.cfiFromElement(section.document.firstElementChild))
      //   this.$log('section.document:', section.document)
      //   let paragraphs = findAllParagraphs(section.document)
      //   for (let i = 1; i < paragraphs.length; i++){
      //     let start = paragraphs[i - 1]
      //     let end = paragraphs[i]
      //     let range = document.createRange();
      //     range.setStart(start, 0);
      //     range.setEnd(end, 0);
      //     let cfiParagraph = new EpubCFI(range, cfiBase.base)
      //     this.$log('chapter Paragraph=', range.toString())
      //     this.$log('chapter cfiParagraph=', cfiParagraph.toString())
      //   }
      // }
      const findParagraphDomElements = (el, deep = 0) => {
        // let res = []
        // if (el.children.length > 1 && el.tagName !== 'head' && el.tagName !== 'html') {
        //   res.push(...el.children)
        // } else if (el.children.length && el.tagName !== 'head') {
        //   for (let child of el.children) res.push(...findAllParagraphs(child))
        // }
        // return res
        let res = []
        if (el.tagName !== 'head') {
          // console.dir(el)
          // console.log(el)
          let childrenTextLen = 0
          for (let child of el.children) {
            childrenTextLen += child.textContent ? child.textContent.length : 0
          }
          let ratio = el.textContent && childrenTextLen ? (childrenTextLen / el.textContent.length) : 0
          if (!el.textContent || ratio > 0.8) { // если есть дети и весь текст в детях - разбиваем
            for (let child of el.children) res.push(...findParagraphDomElements(child, ++deep))
          } else {
            if (el.textContent) res.push(el)
          }
        }
        return res
      }
      // получить все абзацы для озвучки
      let section = await this.book.section(location.start.href)
      if (this.audioPlayer.currentSectionHref !== section.href) {
        this.pauseAudio()
        this.audioPlayer.audio = null
        this.audioPlayer.isPlaying = false
        this.audioPlayer.paragraphs = []
        this.audioPlayer.currentParagraphIndx = -1
        this.audioPlayer.findCutsRes = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.LST_CONTENT_CUTS,
            oidSphere: this.contentKalpa.oid
          }
        })
        this.audioPlayer.currentSectionHref = section.href

        let contents = await section.load(this.book.load.bind(this.book))
        // this.$logD('section.document', section.document)
        let paragraphElements = findParagraphDomElements(section.document) // все параграфы данного документа
        // for (let el of paragraphElements) console.dir(el)
        let cfiBase = new EpubCFI(location.start.cfi)
        for (let i = 0; i < paragraphElements.length; i++) {
          let startElement = paragraphElements[i]
          let epubCfiText = startElement.textContent
          let endElement = startElement
          // если следующий абзац - короткий - соединяем его с текущим в один большой параграф (только если общий родитель - иначе получается кривой epubCfi)
          while (i < paragraphElements.length - 1 &&
          endElement.parentNode === paragraphElements[i + 1].parentNode &&
          paragraphElements[i + 1].textContent.length < 88 &&
          epubCfiText.length < 888) {
            endElement = paragraphElements[++i]
            epubCfiText += '\n' + endElement.textContent
          }

          let range = document.createRange();
          range.setStart(startElement, 0);
          // range.setEnd(endElement.nextSibling, 0)
          range.setEnd(paragraphElements[i + 1] ? paragraphElements[i + 1] : endElement, 0)

          // if (i < paragraphElements.length - 1) { // так надо для формирования epubCfi
          //   range.setEnd(paragraphElements[i + 1], 0)
          //   // range.setEndBefore(paragraphElements[i + 1])
          // } else {
          //   range.setEndAfter(endElement) // epubCfi будет кривой (но ничего не поделать...)
          // }
          let epubCfi = (new EpubCFI(range, cfiBase.base)).toString()

          // console.dir(startElement)
          // console.dir(endElement)
          // console.dir(paragraphElements[i + 1])
          // console.dir(range)
          // this.$logD('epubCfi=', epubCfi)

          // this.$logD('startElement', startElement)
          // this.$logD('endElement', endElement)
          // this.$logD('nextElement', paragraphElements[i + 1])
          // console.dir(range.startContainer)
          // console.dir(range.endContainer)
          // console.log(range.startContainer)
          // console.log(range.endContainer)
          // this.$logD('epubCfiText', epubCfiText)
          // this.$logD('epubCfi=', epubCfi)
          let cuts = this.audioPlayer.findCutsRes.items.filter(item => item.epubCfi === epubCfi) // может быть несколько вар-тов с разной озвучкой
          this.audioPlayer.paragraphs.push({ epubCfi, epubCfiText, cuts })
        }
      }
    },
  }
}
</script>
