package app.kalpa;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class ShareActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
    }});
  }
  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    String action = intent.getAction();
    String type = intent.getType();
//    showDialog("MainActivity onNewIntent::" + action + "::" + type);
    // showDialog(" bridge.getIntentUri() = " +  bridge.getIntentUri().toString());
//    showDialog(" bridge.getLocalUrl() = " +  bridge.getLocalUrl());

    if (Intent.ACTION_SEND.equals(action) && type != null) {
      if (type.startsWith("text/")) {
        try {
          handleSendText(intent); // Handle text being sent
        } catch (JSONException e) {
          e.printStackTrace();
        }
      } else if (type.startsWith("image/")) {
        handleSendImage(intent); // Handle single image being sent
      } else if (type.startsWith("video/")) {
        handleSendVideo(intent); // Handle single image being sent
      }
    } else if (Intent.ACTION_SEND_MULTIPLE.equals(action) && type != null) {
      if (type.startsWith("image/")) {
        handleSendMultipleImages(intent); // Handle multiple images being sent
      } else if (type.startsWith("video/")) {
        handleSendMultipleVideo(intent); // Handle single image being sent
      }
    } else {
      // Handle other intents, such as being started from the home screen
    }
  }

  private void showDialog(String text){
    AlertDialog.Builder builder = new AlertDialog.Builder(this);
    builder.setTitle("Title");
    builder.setMessage(text);
    builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
      public void onClick(DialogInterface dialog, int id) {
        // You don't have to do anything here if you just
        // want it dismissed when clicked
      }
    });

    // Create the AlertDialog object and return it
    builder.create();
    builder.show();
  }

  private void handleSendText(Intent intent) throws JSONException {
    String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
//    showDialog("handleSendText");
    if (sharedText != null) {
      Log.e("todo ",   sharedText);
      // Update UI to reflect text being shared
//      showDialog(sharedText);
      JSONObject data = new JSONObject();
      data.put("dataKey", sharedText);

      bridge.triggerJSEvent("myCustomEvent", "window", "{ 'dataKey': 'dataValue1' }");
      new Handler().postDelayed(new Runnable() {
        @Override
        public void run() {
          bridge.triggerJSEvent("myCustomEvent", "window", "{ 'dataKey': 'dataValue2' }");
        }
      }, 10000);

//      bridge.triggerWindowJSEvent("shareEventKalpa", data.toString());
//      bridge.triggerJSEvent("shareEventKalpa", "window");
//      bridge.triggerJSEvent("shareEventKalpa", "document");

//      new Handler().postDelayed(new Runnable() {
//        @Override
//        public void run() {
//          bridge.triggerWindowJSEvent("shareEventKalpa", "test");
//          bridge.triggerJSEvent("shareEventKalpa", "window");
//          bridge.triggerJSEvent("shareEventKalpa", "document");
//        }
//      }, 10000);

    }
  }

  // todo сделать шаринг данных через capacitor Storage API
  private void handleSendImage(Intent intent) {
    Uri imageUri = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if (imageUri != null) {
      Log.e("todo ",  imageUri.toString());
      // Update UI to reflect image being shared
    }
  }

  private void handleSendVideo(Intent intent) {
    Uri videoUri = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
    if (videoUri != null) {
      Log.e("todo ",  videoUri.toString());
      // Update UI to reflect image being shared
    }
  }

  private void handleSendMultipleImages(Intent intent) {
    ArrayList<Uri> imageUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
    if (imageUris != null) {
      // Update UI to reflect multiple images being shared
    }
  }

  private void handleSendMultipleVideo(Intent intent) {
    ArrayList<Uri> videoUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
    if (videoUris != null) {
      // Update UI to reflect multiple images being shared
    }
  }

}
