//
//  ShareViewController.swift
//  share
//
//  Created by IGOR on 22.04.2020.
//

import UIKit
import Social

extension URL {

    mutating func appendQueryItem(name: String, value: String?) {

        guard var urlComponents = URLComponents(string: absoluteString) else { return }

        // Create array of existing query items
        var queryItems: [URLQueryItem] = urlComponents.queryItems ??  []

        // Create query item
        let queryItem = URLQueryItem(name: name, value: value)

        // Append the new query item in the existing query items array
        queryItems.append(queryItem)

        // Append updated query items array in the url component object
        urlComponents.queryItems = queryItems

        // Returns the url from new url components
        self = urlComponents.url!
    }
}

class ShareViewController: SLComposeServiceViewController {
    
    //  Function must be named exactly like this so a selector can be found by the compiler!
    //  Anyway - it's another selector in another instance that would be "performed" instead.
    @objc func openURL(_ url: URL) -> Bool {
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                return application.perform(#selector(openURL(_:)), with: url) != nil
            }
            responder = responder?.next
        }
        return false
    }
    
    override func isContentValid() -> Bool {
        // Do validation of contentText and/or NSExtensionContext attachments here
        return true
    }

    //пример для других типов данных (картинки/видео) https://github.com/4321ip/cordova-plugin-openwith/blob/master/src/ios/ShareExtension/ShareViewController.m
    
    func openApp(urlData: String){
        // let xxx = contentText
        var url = URL(string: "app.kalpa://share")!
        url.appendQueryItem(name: "contentUrl", value: urlData)
        url.appendQueryItem(name: "contentText", value: contentText)
//        guard let url = URL(string: "kalpa://share/?data=" + urlData) else { return }
        // Запуск Containing App через url-scheme
//        print(" self.extensionContext?.open(url, completionHandler: nil): " + url.absoluteString)
        openURL(url)
        
        // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
        
        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }
    override func didSelectPost() {
        // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.

        if let item = extensionContext?.inputItems.first as? NSExtensionItem {
            if let itemProvider = item.attachments?.first as? NSItemProvider {
                if itemProvider.hasItemConformingToTypeIdentifier("public.text") {
                    itemProvider.loadItem(forTypeIdentifier: "public.text", options: nil, completionHandler: { (text, error) -> Void in
                        if let shareText = text as? NSString {
                            // send url to app
                            self.openApp(urlData: shareText as String)
                        }
                    })
                } else if itemProvider.hasItemConformingToTypeIdentifier("public.url") {
                    itemProvider.loadItem(forTypeIdentifier: "public.url", options: nil, completionHandler: { (url, error) -> Void in
                        if let shareURL = url as? NSURL {
                            // send url to app
                            self.openApp(urlData: shareURL.absoluteString ?? "")
                        }
                    })
                } else if itemProvider.hasItemConformingToTypeIdentifier("public.image") {
                    itemProvider.loadItem(forTypeIdentifier: "public.image", options: nil, completionHandler: { (item, error) -> Void in
                        self.openApp(urlData: "public.image")
                    })
                } else if itemProvider.hasItemConformingToTypeIdentifier("public.movie") {
                    itemProvider.loadItem(forTypeIdentifier: "public.movie", options: nil, completionHandler: { (item, error) -> Void in
                        self.openApp(urlData: "public.movie")
                    })
                } else {
                    itemProvider.loadItem(forTypeIdentifier: "public.item", options: nil, completionHandler: { (item, error) -> Void in
                        // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
                        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
                    })
                }
            }
        }
        }
    
    override func configurationItems() -> [Any]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }

}
    
