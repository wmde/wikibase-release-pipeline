<?php

// https://github.com/ProfessionalWiki/WikibaseLocalMedia
## WikibaseLocalMedia Configuration
if ( ExtensionRegistry::getInstance()->isLoaded( 'WikibaseRepository' ) ) {
    wfLoadExtension( 'WikibaseLocalMedia' );
}