from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

# 1. Serializer Đăng ký (Register)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) # Chỉ nhận password vào, không trả ra khi xem info

    class Meta:
        model = User
        # Các trường người dùng nhập khi đăng ký
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'phone', 'address']

    def create(self, validated_data):
        # Tạo user với password đã mã hóa
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            role='CUSTOMER' # Mặc định đăng ký là Khách hàng
        )
        return user

# 2. Serializer Thông tin cá nhân (Profile)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Trả về đầy đủ thông tin (trừ password)
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'address', 'avatar', 'role', 'rank', 'loyalty_points', 'date_joined']
        # Người dùng không được tự sửa Role, Rank hay Điểm thưởng
        read_only_fields = ['role', 'rank', 'loyalty_points', 'date_joined']

# 3. Custom Login (Trả về cả Token + Role + Tên để Frontend dễ xử lý)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Thêm role vào trong mã token (để giải mã là biết ngay quyền)
        token['role'] = user.role
        token['username'] = user.username
        return token
    
    User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'avatar', 'is_active', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, # Password chỉ để ghi, không hiện ra khi get
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        """Override lại hàm tạo để mã hóa mật khẩu"""
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password) # Mã hóa password
        else:
            user.set_password('Cinestar@123') # Mật khẩu mặc định nếu không nhập
        user.save()
        return user

    def update(self, instance, validated_data):
        """Cập nhật thông tin: Chỉ đổi pass nếu có nhập mới"""
        password = validated_data.pop('password', None)
        
        # 1. Cập nhật các thông tin thường (email, phone, role...)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # 2. Xử lý Mật khẩu
        # Chỉ khi nào có password (không rỗng) thì mới set lại
        if password and password.strip() != "": 
            instance.set_password(password)
            
        instance.save()
        return instance
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'loyalty_points', 'role', 'password', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, # Không bắt buộc nhập pass
            'email': {'required': False}, # Cho phép tạo nhanh bằng SĐT, cập nhật email sau
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        # Mặc định Role là CUSTOMER
        validated_data['role'] = 'CUSTOMER'
        
        # Xử lý mật khẩu: Nếu không nhập, đặt mặc định là số điện thoại
        password = validated_data.pop('password', None)
        phone = validated_data.get('phone', '123456')
        
        user = User(**validated_data)
        user.set_password(password if password else phone) # Pass mặc định là SĐT
        user.save()
        return user
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)