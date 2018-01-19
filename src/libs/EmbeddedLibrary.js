EmbeddedLibrary = function(ui, data, title)  {
    StorageFile.call(this, ui, data, title);
};

//Extends mxEventSource
mxUtils.extend(EmbeddedLibrary, StorageFile);

EmbeddedLibrary.prototype.getHash = function() {
    return '<embedded: ' + this.title + '>';
};

EmbeddedLibrary.prototype.getTitle = function() {
    return this.title;
};

EmbeddedLibrary.prototype.isAutosave = function() {
    return false;
};

/**
 * Overridden to avoid updating data with current file.
 */
EmbeddedLibrary.prototype.isEditable = function(title, success, error) {
    return false;
};

/**
 * Overridden to avoid updating data with current file.
 */
EmbeddedLibrary.prototype.saveAs = function(title, success, error)  {
    // Cannot be saved
};

/**
 * Overridden to avoid updating data with current file.
 */
EmbeddedLibrary.prototype.open = function() {
    // Do nothing - this should never be called
};
