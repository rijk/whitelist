import config from 'config'
import utils from 'utils'
import classes from 'dom-classes'
import event from 'dom-events'
import Default from './default'
import Normal from 'smooth-scrolling'
import Smooth from '../lib/smooth/work'

class Work extends Default {
    
    constructor(opt) {
        
        super(opt);

        this.slug = 'work'
        this.state = false

        this.handlerAll = this.handlerAll.bind(this)
        this.showVideo = this.showVideo.bind(this)
        this.removeVideo = this.removeVideo.bind(this)
    }
    
    init(req, done) {
        
        super.init(req, done)
    }
    
    dataAdded(done) {
        
        super.dataAdded()

        this.list = utils.js.arrayFrom(this.page.querySelectorAll('ul li a'))

        this.splitText()
        this.addEvents()
        this.createList()
        this.addScroll()
        this.animateGradient()

        done()
    }
    
    addScroll() {
        
        this.smooth = new Smooth({
            extends: true,
            vs: { firefoxMultiplier: 20, touchMultiplier: 2.5 },
            noscrollbar: true,
            section: this.ui.section,
            layer: this.ui.layer,
            viewport: this.ui.viewport
        })
        
        this.smooth.init()
    }

    createList() {

        this.list.forEach((el) => {
            
            const video = document.createElement('div')
            const image = el.getAttribute('data-image')
            
            video.style.backgroundImage = `url(${image})`
            video.style.visibility = 'hidden'

            el.parentNode.appendChild(video)
        })
    }

    splitText() {

        this.split = []
        
        utils.js.arrayFrom(this.ui.split).forEach((el, index) => {

            this.split[this.split.index] = new SplitText(el, { type: el.getAttribute('data-split') })
        })
    }

    addEvents() {

        event.on(this.ui.bind, 'click', this.handlerAll)

        this.list.forEach((el) => event.on(el, 'mouseenter', this.showVideo))
        this.list.forEach((el) => event.on(el, 'mouseleave', this.removeVideo))
    }

    removeEvents() {

        this.gradient.kill()

        event.off(this.ui.bind, 'click', this.handlerAll)
        
        this.list.forEach((el) => event.off(el, 'mouseenter', this.showVideo))
        this.list.forEach((el) => event.off(el, 'mouseleave', this.removeVideo))
    }

    animateGradient() {
        
        const patterns = [['#ddb6d5', '#c1b0e3'], ['#a0b8ea', '#9ad3d9'], ['#9dd5ce', '#c0e3ca'], ['#ddb6d5', '#b9aee7'], ['#e8b9c3', '#ffd9bb'], ['#a1b5ec', '#96e1cf']]

        this.gradient = new TimelineMax({ paused:true, repeatDelay: 1, repeat: -1, yoyo: true })
        
        patterns.forEach((colors) => this.gradient.staggerTo('#gradient stop', 10, { cycle: { stopColor: colors }, ease: Power3.easeInOut }, .1))

        this.gradient.progress(1).progress(0).restart()
    }

    handlerAll(e) {

        this.state ? this.closeAll() : this.openAll()
    }

    openAll() {

        this.state = true

        this.scroll = new Normal({
            section: this.ui.scroll
        })

        this.scroll.init()

        classes.add(config.$body, `has-all-open`)

        const tl = new TimelineMax({ paused: true, onComplete: () => {
            this.list.forEach((el) => el.parentNode.style.overflow = 'visible')
            this.smooth.removeEvents()
            TweenMax.staggerTo(this.page.querySelectorAll('small'), 1, { autoAlpha: .2 }, .1)
        }})
        tl.to(this.ui.all, 1.1, { autoAlpha: 1, ease: Expo.easeInOut })
        tl.staggerTo(this.list, 1, { y: '0%', autoAlpha: 1 }, .06, .5)
        tl.restart()
    }

    closeAll() {

        this.scroll.destroy()
        this.smooth.addEvents()

        classes.remove(config.$body, `has-all-open`)

        this.list.forEach((el) => el.parentNode.style.overflow = '')

        const tl = new TimelineMax({ paused: true, onComplete: () => this.state = false })
        tl.staggerTo(this.list, .8, { autoAlpha: 0, clearProps: 'all' }, .01, 0)
        tl.to(this.ui.all, 1.6, { autoAlpha: 0 })
        tl.restart()
    }

    showVideo(e) {

        const div = e.currentTarget.nextElementSibling

        TweenMax.to(div, .6, { autoAlpha: 1 })
    }

    removeVideo(e) {

        const div = e.currentTarget.nextElementSibling

        TweenMax.to(div, .6, { autoAlpha: 0, clearProps: 'transform' })
    }
    
    animateIn(req, done) {

        const home = req.previous && req.previous.route && req.previous.route === (config.routes.default || config.routes.home)
        
        classes.add(config.$body, `is-${this.slug}`)
        
        const tl = new TimelineMax({ paused: true, onComplete: () => {
            classes.remove(config.$body, 'is-loading')
            classes.add(this.page, 'has-hover')
            done()
        }})
        tl.to(this.page, 1, { autoAlpha: 1 })
        tl.from(this.ui.letter[0], 2.5, { scale: 1.6, x: '-100%', ease: Expo.easeInOut }, .6)
        tl.staggerFrom(this.ui.stagger, 1.1, { y: '100%', autoAlpha: 0, ease: Power4.easeInOut, clearProps: 'all' }, .06, .25)
        tl.to(this.ui.bind, 1, { autoAlpha: 1 }, 1)
        tl.restart()
    }
    
    animateOut(req, done) {
        
        const all = this.state

        all && this.closeAll()

        classes.add(config.$body, 'is-loading')
        classes.remove(this.page, 'has-hover')

        const tl = new TimelineMax({ paused: true, onComplete: () => {
            classes.remove(config.$body, `is-${this.slug}`)
            done()
        }})
        tl.set(this.page, { zIndex: 10 })
        this.smooth && tl.to(this.smooth.vars, 1.8, { target: this.smooth.vars.bounding/2, ease: Expo.easeInOut })
        tl.to(this.ui.letter, 2.5, { scale: 1.6, x: '-100%', ease: Expo.easeInOut }, 0)
        tl.to(this.page, 1.1, { y: all ? '0%' : '100%', autoAlpha: all ? 0 : 1, ease: Expo.easeInOut }, 0)
        tl.restart()
    }

    resize(width, height) {

        super.resize(width, height)
    }

    destroy(req, done) {

        super.destroy()

        this.removeEvents()

        this.smooth && this.smooth.destroy()
        
        this.page.parentNode.removeChild(this.page)
        
        done()
    }
}

module.exports = Work