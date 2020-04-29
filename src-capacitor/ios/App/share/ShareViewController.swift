//
//  ShareViewController.swift
//  share
//
//  Created by IGOR on 22.04.2020.
//

import UIKit
import Social


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

    override func didSelectPost() {
        // This is called after the user selects Post. Do the upload of contentText and/or NSExtensionContext attachments.

        // todo поллучить данные для шаринга и сохранить их в совместном хранилище(app groups)
        //передать идентификатор на эти данные в Containing App
        
        let shareDataId = "shareDataId"
        guard let url = URL(string: "kalpa://" + shareDataId) else { return }
        // Запуск Containing App через url-scheme
        print(" self.extensionContext?.open(url, completionHandler: nil): " + url.absoluteString)
        openURL(url)
//        self.extensionContext!.open(url, completionHandler: nil)
        
        	
        //      if UIApplication.shared.canOpenURL(url) {
        //          UIApplication.shared.open(url, options: [:], completionHandler: nil)
        //      } else {
        //          let alert = UIAlertController(title: "Receiver не найден", message: "Приложение приемник ReceiverApp не установлено на данном устройстве", preferredStyle: .alert)
        //          let ok = UIAlertAction(title: "Ok", style: .default, handler: {
        //              _ in
        //              self.dismiss(animated: true, completion: nil)
        //          })
        //          alert.addAction(ok)
        //
        //          self.present(alert, animated: true, completion: nil)
        //      }
        
        
        // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
        
        }
    
    override func configurationItems() -> [Any]! {
        // To add configuration options via table cells at the bottom of the sheet, return an array of SLComposeSheetConfigurationItem here.
        return []
    }

}
    