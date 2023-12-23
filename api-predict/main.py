import pickle
import numpy as np

# Load models
model = pickle.load(open('model.pkl', 'rb'))  
scaler = pickle.load(open('scaler.pkl', 'rb'))
label_encoder = pickle.load(open('label_encoder.pkl', 'rb'))

# New data 
new_data = np.array([[30, 85, 94, 38.0, 11, 92, 39.8, 88, 90]])  

# Predict
new_data = scaler.transform(new_data)
predicted_probabilities = model.predict(new_data)
predicted_class_index = np.argmax(predicted_probabilities)  
predicted_class = label_encoder.classes_[predicted_class_index]

print(f'Predicted Health Status: {predicted_class}')