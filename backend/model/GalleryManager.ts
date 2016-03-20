import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime';

import {Directory} from "../../common/entities/Directory";
import {Photo} from "../../common/entities/Photo";

export class GalleryManager {


    public static listDirectory(relativeDirectoryName, cb:(error: any,result:Directory) => void){
        let directoryName = path.basename(relativeDirectoryName);
        let directoryParent = path.join( path.dirname(relativeDirectoryName),"/");
        let absoluteDirectoryName = path.join(__dirname,"/../../demo/images", relativeDirectoryName);

        let directory = new Directory(1,directoryName,directoryParent,new Date(),[],[]);

        fs.readdir(absoluteDirectoryName, function (err, list) {

            if(err){
                return cb(err,null);
            }


            for (let i = 0; i < list.length; i++) {
                let file = list[i];
                let fullFilePath = path.resolve(absoluteDirectoryName, file);
                if(fs.statSync(fullFilePath).isDirectory()){
                    directory.directories.push(new Directory(2,file,relativeDirectoryName,new Date(),[],[]));
                }

                if(GalleryManager.isImage(fullFilePath)){
                    directory.photos.push(new Photo(1,file));
                }
            }

            return cb(err, directory);

        });
    }

    private static isImage(fullPath){
        let imageMimeTypes = [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/pjpeg',
            'image/tiff',
            'image/webp',
            'image/x-tiff',
            'image/x-windows-bmp'
        ];

        var extension = mime.lookup(fullPath);

        if (imageMimeTypes.indexOf(extension) !== -1) {
            return true;
        }

        return false;
    }

}