/**
 * Override to patch in XTemplate loader support and model binding
 */
Ext.define('Ext.ux.TplComponentLoader', {
    override: 'Ext.ComponentLoader',

    constructor: function (config) {
        var me = this,
            target = config.target,
            model = config.model;

        // check if we passed model in config to bind
        if (model) {
            me.bindModel(model);
            target.data = target.data || {};
            Ext.merge(target.data, model.data);
        }
        me.callParent(arguments);
    },
    /**
     * check for 'tpl' renderer
     * @param options
     * @returns {*}
     */
    load: function (options) {
        var me = this;
        // support for 'tpl' loaders.
        if (me.renderer === 'tpl') {
            // if tplId, embedded template, dont need to load
            if (me.tplId) {
                return me.loaderEmbeddedXTemplateRenderer(me);
            }
            // remote template, set renderer, let base load via url
            me.renderer = me.loaderXTemplateRenderer;
        }
        return me.callParent(arguments);
    },
    /**
     * this renderer expects XTemplate source remote via {url}
     * @param loader
     * @param response
     * @param active
     * @returns {boolean}
     */
    loaderXTemplateRenderer: function (loader, response, active) {
        var me = this,
            cmp = loader.getTarget();

        cmp.tpl = new Ext.XTemplate(response.responseText);
        cmp.update(cmp.data);
        return true;
    },
    /**
     * this renderer expects XTemplate source in page via script {id}
     * @param loader
     * @returns {boolean}
     */
    loaderEmbeddedXTemplateRenderer: function (loader) {
        var me = this,
            cmp = loader.getTarget(),
            id = loader.tplId,
            el = Ext.get(id);

        if (!el) {
            throw new Error(id + ': template not found');
        }
        cmp.tpl = new Ext.XTemplate(el.getHTML());
        // don't call update, base will
        return true;
    },
    /**
     * if a model is passed in config, it is expected to bind to the XTemplate
     * @param model
     */
    bindModel: function (model) {
        var me = this;
        // save ref to model and intercept afterEdit
        me.model = model;
        Ext.Function.interceptAfter(model, 'afterEdit', me.afterModelEdit, me);
    },
    /**
     * update the template after the model is edited
     * @param modifiedFieldNames
     * @returns {boolean}
     */
    afterModelEdit: function (modifiedFieldNames) {
        var me = this,
            cmp = me.getTarget(),
            model = me.model;

        cmp.update(model.data);
        return true;
    }
});